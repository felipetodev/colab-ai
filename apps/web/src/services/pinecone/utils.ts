import { getEmbeddings } from '@/lib/utils.edge'
import {
  Pinecone,
  type PineconeConfiguration,
  type Index,
  type PineconeRecord,
  type ScoredPineconeRecord
} from '@pinecone-database/pinecone'
import { type Document } from 'langchain/dist/document'
import { type ConfigurationParameters } from 'openai-edge'

const sliceIntoChunks = <T>(arr: T[], chunkSize: number) => {
  return Array.from({ length: Math.ceil(arr.length / chunkSize) }, (_, i) =>
    arr.slice(i * chunkSize, (i + 1) * chunkSize)
  )
}

export const chunkedUpsert = async (
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

export async function embedDocument ({ pageContent, metadata }: Document, settings: ConfigurationParameters): Promise<PineconeRecord> {
  try {
    // Generate OpenAI embeddings for the document content
    const embedding = await getEmbeddings(pageContent, settings)

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

export type Metadata = {
  id: string
  refId: string
  chunk: string
}

export const getMatchesFromEmbeddings = async ({
  embeddings,
  topK,
  namespace,
  indexName,
  settings,
  filterIds
}: {
  embeddings: number[]
  topK: number
  namespace?: string
  indexName: string
  settings: PineconeConfiguration
  filterIds: string[]
}): Promise<Array<ScoredPineconeRecord<Metadata>>> => {
  // Obtain a client for Pinecone
  const pinecone = new Pinecone(settings)

  if (indexName === '') {
    throw new Error('PINECONE_INDEX environment variable not set')
  }

  // Retrieve the list of indexes to check if expected index exists
  const indexes = await pinecone.listIndexes()
  if (indexes.filter(i => i.name === indexName).length !== 1) {
    throw new Error(`Index ${indexName} does not exist`)
  }

  // Get the Pinecone index
  const index = pinecone.Index<Metadata>(indexName)

  // Get the namespace
  const pineconeNamespace = index.namespace(namespace ?? '')

  try {
    // Query the index with the defined request
    const queryResult = await pineconeNamespace.query({
      vector: embeddings,
      topK,
      includeMetadata: true,
      filter: {
        id: { $in: filterIds }
      }
    })

    return queryResult.matches ?? []
  } catch (e) {
    // Log the error and throw it
    console.log('Error querying embeddings: ', e)
    throw new Error(`Error querying embeddings: ${e as string}`)
  }
}
