import type { Message as VercelChatMessage } from 'ai'
import { getEmbeddings, getMatchesFromEmbeddings } from '@/lib/utils.edge'
import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { StreamingTextResponse } from 'ai'
import { supabase } from 'src/services/supabase/api'

export const runtime = 'edge'

export type Metadata = {
  id: string
  refId: string
  chunk: string
}

const TEMPLATE = `You are a representative who loves to help people!
Given the following sections from the documentation (preceded by a section id), answer the question using only that information, outputted in Markdown format.

Here is some context which might contain valuable information to answer the question:
{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`

export async function POST (req: Request) {
  const body = await req.json() as { messages?: VercelChatMessage[], userId?: string, docsId?: string[], prompt?: string }
  const messages = body.messages ?? []
  // const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const userId = body.userId!
  const docsId = body.docsId
  const agentPrompt = body.prompt

  // Get settings from supabase (sdk doesn't work in edge)
  const { data: user } = await supabase.getUser({
    id: userId,
    select: 'pineconeApiKey, pineconeEnvironment, pineconeIndex, openaiKey, openaiOrg'
  })

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex,
    openaiKey,
    openaiOrg = null
  } = user?.[0] ?? {}

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndex) {
    throw new Error('Missing Pinecone ⚡ credentials')
  }

  const embedding = await getEmbeddings(
    currentMessageContent,
    {
      apiKey: openaiKey,
      ...(openaiOrg && { organization: openaiOrg })
    }
  )

  const matches = await getMatchesFromEmbeddings({
    embeddings: embedding,
    topK: 3,
    indexName: pineconeIndex,
    settings: {
      apiKey: pineconeApiKey,
      environment: pineconeEnvironment
    },
    filterIds: docsId ?? []
  })

  // const minScore = 0.7
  // const qualifyingDocs = matches.filter(m => m.score && m.score > minScore)
  const content = matches ? matches.map(match => (match.metadata as Metadata).chunk).join('\n') : ''

  console.log('==🚛==🚛==🚛==🚛==🚛==🚛==🚛==🚛==🚛==🚛')
  console.log(content)
  console.log('==🚗==🚗==🚗==🚗==🚗==🚗==🚗==🚗==🚗==🚗')

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: openaiKey,
    temperature: 0.2
  })

  const outputParser = new BytesOutputParser()

  const chain = prompt.pipe(model).pipe(outputParser)

  const stream = await chain.stream({
    prompt: agentPrompt ?? '',
    chat_history: content,
    input: currentMessageContent
  })

  return new StreamingTextResponse(stream)
}
