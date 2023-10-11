import { NextResponse } from 'next/server'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import type { DocumentProps } from '@/lib/types/document'

export const runtime = 'edge'

export async function POST (req: Request) {
  const { name, docId, content, database } = await req.json() as {
    name: DocumentProps['name']
    docId: DocumentProps['id']
    content: DocumentProps['content']
    database: DocumentProps['database']
  }

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || docId === null) {
    return NextResponse.json({ error: 'Something went wrong creating embedding' })
  }

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

  const parsedDocs = content.map((doc) => {
    return {
      ...doc,
      pageContent: doc.pageContent.replace(/\n/g, ' ')
    }
  })

  const ids = await store.addDocuments(parsedDocs)

  // update document to trained 'true' status
  await supabase.from('documents')
    .update({
      name,
      database,
      is_trained: true,
      embeddings_ids: ids
    })
    .eq('id', docId)

  return NextResponse.json({ finished: true, docId })
}

export async function DELETE (req: Request) {
  const { docId, ids } = await req.json() as { docId: DocumentProps['id'], ids: number[] }

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || !docId) {
    return NextResponse.json({ error: 'Something went wrong deleting embeddings' })
  }

  const { data: settings } = await supabase.from('users')
    .select('supabaseUrl:supabase_url, supabaseSecretKey:supabase_secret_key, openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)

  const {
    supabaseUrl,
    supabaseSecretKey,
    openaiKey,
    openaiOrg = null
  } = settings?.[0] ?? {}

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
  await supabase.from('documents')
    .update({ is_trained: false, embeddings_ids: null })
    .eq('id', docId)

  return NextResponse.json({ test: true, ids })
}
