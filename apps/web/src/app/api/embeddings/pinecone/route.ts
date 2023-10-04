import { type DocumentProps } from '@/lib/types/document'
import { Pinecone } from '@pinecone-database/pinecone'
import { NextResponse } from 'next/server'
import { chunkedUpsert, embedDocument } from 'src/services/pinecone/utils'
import { supabase } from 'src/services/supabase/api'

const {
  SUPABASE_SECRET_KEY,
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
} = process.env

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function POST (req: Request) {
  const { name, userId, docId, content } = await req.json() as {
    userId: string
    name: DocumentProps['name']
    docId: DocumentProps['id']
    content: DocumentProps['content']
  }

  const { data: user } = await supabase.getUser({
    id: userId,
    select: 'pineconeApiKey, pineconeEnvironment, pineconeIndex, openaiKey, openaiOrg'
  })

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex,
    openaiKey,
    openaiOrg
  } = user?.[0] ?? {}

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

  await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/documents?id=eq.${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
    },
    body: JSON.stringify({
      name,
      is_trained: true,
      embeddings_ids: ids
    })
  })

  return NextResponse.json({ finished: true, name, ids })
}

export async function DELETE (req: Request) {
  const {
    userId,
    docId,
    ids
  } = await req.json() as { userId: string, docId: DocumentProps['id'], ids: string[] }

  const { data: user } = await supabase.getUser({
    id: userId,
    select: 'pineconeApiKey, pineconeEnvironment, pineconeIndex'
  })

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex
  } = user?.[0] ?? {}

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndex) {
    throw new Error('Missing Pinecone ⚡ credentials')
  }

  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment
  })

  const index = pinecone.Index(pineconeIndex)
  await index.deleteMany(ids)

  await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/documents?id=eq.${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
    },
    body: JSON.stringify({
      is_trained: false,
      embeddings_ids: null
    })
  })

  return NextResponse.json({ delete: true })
}
