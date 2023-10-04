import { OpenAIApi, Configuration, type ConfigurationParameters } from 'openai-edge'

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
