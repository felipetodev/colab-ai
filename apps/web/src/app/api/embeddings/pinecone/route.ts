import { type DocumentProps } from '@/lib/types/document'
import { Pinecone } from '@pinecone-database/pinecone'
import { NextResponse } from 'next/server'
import { chunkedUpsert, embedDocument } from 'src/services/pinecone/utils'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  const { name, docId, content } = await req.json() as {
    name: DocumentProps['name']
    docId: DocumentProps['id']
    content: DocumentProps['content']
  }

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || docId === null) {
    return NextResponse.json({ error: 'Something went wrong creating embedding' })
  }

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

  const indexList = await pinecone.listIndexes()

  const indexExists = indexList.some(index => index.name === pineconeIndex)
  if (!indexExists) {
    await pinecone.createIndex({
      name: pineconeIndex,
      dimension: 1536,
      waitUntilReady: true
    })
  }

  const index = pinecone.Index(pineconeIndex)

  const vectors = await Promise.all(content.flat().map(
    async (e) => await embedDocument(
      e,
      {
        apiKey: openaiKey,
        ...(openaiOrg && { organization: openaiOrg })
      }
    )
  ))
  const ids = vectors.map(({ id }) => id)

  // Upsert vectors into the Pinecone index
  await chunkedUpsert(index, vectors, '', 10)

  await supabase.from('documents')
    .update({
      name,
      is_trained: true,
      embeddings_ids: ids
    })
    .eq('id', docId)

  return NextResponse.json({ finished: true, name, ids })
}

export async function DELETE (req: Request) {
  const {
    docId,
    ids
  } = await req.json() as { docId: DocumentProps['id'], ids: string[] }

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || docId === null) {
    return NextResponse.json({ error: 'Something went wrong creating embedding' })
  }

  const { data } = await supabase.from('users')
    .select('pineconeApiKey:pinecone_key, pineconeEnvironment:pinecone_env, pineconeIndex:pinecone_index')
    .eq('id', user.id)

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex
  } = data?.[0] ?? {}

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndex) {
    throw new Error('Missing Pinecone ⚡ credentials')
  }

  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment
  })

  const index = pinecone.Index(pineconeIndex)
  await index.deleteMany(ids)

  await supabase.from('documents')
    .update({
      is_trained: false,
      embeddings_ids: null
    })
    .eq('id', docId)

  return NextResponse.json({ delete: true })
}
