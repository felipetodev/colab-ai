import { OpenAIApi, Configuration, type ConfigurationParameters } from 'openai-edge'
import {
  Pinecone,
  type PineconeConfiguration,
  type ScoredPineconeRecord
} from '@pinecone-database/pinecone'

export async function getEmbeddings (input: string, settings: ConfigurationParameters) {
  const config = new Configuration(settings)
  const openai = new OpenAIApi(config)

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
