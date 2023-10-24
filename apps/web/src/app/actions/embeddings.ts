'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { type DocumentProps } from '@/lib/types/document'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

type Props = {
  id: DocumentProps['id']
  name: DocumentProps['name']
  database: DocumentProps['database']
  content: DocumentProps['content']
}

export const createSupaEmbeddings = async (payload: Props): Promise<ActionResponse> => {
  const {
    name,
    id: docId,
    content,
    database
  } = payload

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { data: settings } = await supabase.from('users')
    .select('supabaseUrl:supabase_url, supabaseSecretKey:supabase_secret_key,openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)
    .limit(1)
    .maybeSingle()

  const {
    supabaseUrl,
    supabaseSecretKey,
    openaiKey,
    openaiOrg = null
  } = settings ?? {}

  const client = createClient(supabaseUrl, supabaseSecretKey)

  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: openaiKey
    },
    openaiOrg ? { organization: openaiOrg } : {}
  )

  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'embeddings'
  })

  const parsedDocs = content.map(({ pageContent, metadata }) => {
    return {
      metadata: {
        ...metadata,
        name
      },
      pageContent: pageContent.replace(/\n/g, ' ')
    }
  })

  const ids = await store.addDocuments(parsedDocs)

  // update document to trained 'true' status
  const { status } = await supabase.from('documents')
    .update({
      name,
      database,
      is_trained: true,
      embeddings_ids: ids
    })
    .eq('id', docId)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error embedding document' : `${payload.name} embedded successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const createPineconeEmbeddings = async (payload: Props): Promise<ActionResponse> => {
  const {
    name,
    id: docId,
    content,
    database
  } = payload

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { data } = await supabase.from('users')
    .select('pineconeApiKey:pinecone_key, pineconeEnvironment:pinecone_env, pineconeIndex:pinecone_index, openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user.id)

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex,
    openaiKey,
    openaiOrg
  } = data?.[0] ?? {}

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndex) {
    throw new Error('Missing Pinecone ⚡ credentials')
  }

  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment
  })

  const index = pinecone.Index(pineconeIndex)

  await PineconeStore.fromDocuments(
    content.map(doc => { return { ...doc, metadata: { ...doc.metadata, name } } }),
    new OpenAIEmbeddings({
      openAIApiKey: openaiKey
    }, {
      ...(openaiOrg && { organization: openaiOrg })
    }), {
      pineconeIndex: index
    })

  const { status } = await supabase.from('documents')
    .update({
      name,
      database,
      is_trained: true,
      embeddings_ids: ['todo'] // fix this later ☝
    })
    .eq('id', docId)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error embedding document' : `${payload.name} embedded successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const updateEmbedding = async (payload: { id: string, name: string }): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status } = await supabase.from('documents')
    .update({
      name: payload.name
    })
    .eq('id', payload.id)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error updating document' : `${payload.name} updated successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const deleteSupaEmbeddings = async ({ ids, id }: { ids: string[] | number[], id: string }): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { data: settings } = await supabase.from('users')
    .select('supabaseUrl:supabase_url, supabaseSecretKey:supabase_secret_key,openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)
    .limit(1)
    .maybeSingle()

  const {
    supabaseUrl,
    supabaseSecretKey,
    openaiKey,
    openaiOrg = null
  } = settings ?? {}

  const client = createClient(supabaseUrl, supabaseSecretKey)

  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: openaiKey
    },
    openaiOrg ? { organization: openaiOrg } : {}
  )

  const store = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'embeddings'
  })

  await store.delete({ ids })

  // update document previously trained to 'false' status
  const { status } = await supabase.from('documents')
    .update({ is_trained: false, embeddings_ids: null, database: null })
    .eq('id', id)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error deleting embeddings' : 'Embeddings deleted successfully',
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const deletePineconeEmbeddings = async ({ ids, id }: { ids: string[] | number[], id: string }): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status } = await supabase.from('documents')
    .update({ is_trained: false, embeddings_ids: null, database: null })
    .eq('id', id)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error deleting embeddings' : 'Embeddings deleted successfully',
    status: status >= 400 ? 'destructive' : 'success'
  }
}
