import { type DocumentProps } from '@/lib/types/document'
import { type Index, Pinecone, type PineconeRecord } from '@pinecone-database/pinecone'
import { type Document } from 'langchain/dist/document'
import { NextResponse } from 'next/server'
import { OpenAIApi, Configuration } from 'openai-edge'
import { supabase } from 'src/services/supabase/api'

const {
  SUPABASE_SECRET_KEY,
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
} = process.env

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(config)

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  )
}

const chunkedUpsert = async (
  index: Index,
  vectors: PineconeRecord[],
  namespace: string,
  chunkSize = 10
) => {
  // Split the vectors into chunks
  const chunks = sliceIntoChunks<PineconeRecord>(vectors, chunkSize)

  try {
    // Upsert each chunk of vectors into the index
    await Promise.allSettled(
      chunks.map(async (chunk) => {
        try {
          await index.namespace(namespace).upsert(vectors)
        } catch (e) {
          console.log('Error upserting chunk', e)
        }
      })
    )

    return true
  } catch (e) {
    throw new Error(`Error upserting vectors into index: ${e as string}`)
  }
}

async function getEmbeddings (input: string) {
  try {
    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: input.replace(/\n/g, ' ')
    })

    const result = await response.json()
    return result.data[0].embedding as number[]
  } catch (e) {
    console.log('Error calling OpenAI embedding API: ', e)
    throw new Error(`Error calling OpenAI embedding API: ${e as string}`)
  }
}

async function embedDocument ({ pageContent, metadata }: Document): Promise<PineconeRecord> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await getEmbeddings(pageContent)

    // Return the vector embedding object
    return {
      id: crypto.randomUUID(),
      values: embedding,
      metadata: {
        id: metadata.id,
        refId: metadata?.refId ?? crypto.randomUUID(),
        ...(metadata.loc && { pageNumber: metadata.loc.pageNumber }),
        ...(metadata.pdf && { totalPages: metadata.pdf.totalPages }),
        chunk: pageContent
      }
    } as PineconeRecord
  } catch (error) {
    console.log('Error embedding document: ', error)
    throw error
  }
}

export async function POST (req: Request) {
  const { name, userId, docId, content } = await req.json() as {
    userId: string
    name: DocumentProps['name']
    docId: DocumentProps['id']
    content: DocumentProps['content']
  }

  // Get settings from supabase (sdk doesn't work in edge)
  const { data: user } = await supabase.getUser({
    id: userId,
    select: 'pineconeApiKey, pineconeEnvironment, pineconeIndex, openaiKey, openaiOrg'
  })

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex
    // openaiKey,
    // openaiOrg = null
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

  const vectors = await Promise.all(content.flat().map(embedDocument))
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

  // Get settings from supabase (sdk doesn't work in edge)
  let payload: null | any = null
  try {
    const data = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/users?id=eq.${userId}&select=pinecone_key,pinecone_env, pinecone_index`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
      }
    })

    const user = await data.json()

    payload = {
      pineconeApiKey: user[0].pinecone_key,
      pineconeEnvironment: user[0].pinecone_env,
      pineconeIndex: user[0].pinecone_index
    }
  } catch (error) {
    console.error(error)
  }

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex
    // openaiKey
    // openaiOrg = null
  } = payload // refact

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
