import type { Message as VercelChatMessage } from 'ai'
import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { StreamingTextResponse } from 'ai'
import { type AgentProps } from '@/lib/types/agent'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

export const runtime = 'edge'

export type Metadata = {
  id: string
  refId: string
  chunk: string
}

const TEMPLATE = `You are a representative who loves to help people!
Given the following sections from the documentation (preceded by a section id), answer the question using only that information, outputted in Markdown format.
{prompt}

Current conversation:
{chat_history}

Here is some context which might contain valuable information to answer the question:
{context}

User: {input}
AI:`

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

export async function POST (req: Request) {
  const body = await req.json() as {
    messages?: VercelChatMessage[]
    docsId?: AgentProps['docsId']
    prompt?: AgentProps['prompt']
    model?: AgentProps['model']
    temperature?: AgentProps['temperature']
    maxTokens?: AgentProps['maxTokens']
  }
  const messages = body.messages ?? []
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const { docsId, prompt: agentPrompt, model: agentModel, temperature } = body

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) {
    throw new Error('Something went wrong, please contact support')
  }

  const { data: settings } = await supabase.from('users')
    .select('pineconeApiKey:pinecone_key, pineconeEnvironment:pinecone_env, pineconeIndex:pinecone_index, openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user.id)
    .limit(1)
    .maybeSingle()

  const {
    pineconeApiKey,
    pineconeEnvironment,
    pineconeIndex,
    openaiKey,
    openaiOrg = null
  } = settings ?? {}

  if (!pineconeApiKey || !pineconeEnvironment || !pineconeIndex) {
    throw new Error('Missing Pinecone ⚡ credentials')
  }

  const pinecone = new Pinecone({
    apiKey: pineconeApiKey,
    environment: pineconeEnvironment
  })

  const index = pinecone.Index(pineconeIndex)

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({
      openAIApiKey: openaiKey
    }, {
      ...(openaiOrg && { organization: openaiOrg })
    }),
    {
      pineconeIndex: index
    }
  )

  const results = await vectorStore.similaritySearch(
    currentMessageContent,
    3,
    {
      id: { $in: docsId }
    }
  )

  console.log('------------------')
  console.log(results)
  console.log({ references: docsId })
  console.log('------------------')

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const model = new ChatOpenAI({
    modelName: agentModel,
    openAIApiKey: openaiKey,
    temperature,
    maxTokens: -1
  }, {
    ...(openaiOrg && { organization: openaiOrg })
  })

  const outputParser = new BytesOutputParser()

  const chain = prompt.pipe(model).pipe(outputParser)

  const stream = await chain.stream({
    prompt: agentPrompt ?? '',
    chat_history: formattedPreviousMessages.join('\n'),
    context: results.map(({ pageContent }) => pageContent).join('\n'),
    input: currentMessageContent
  })

  return new StreamingTextResponse(stream)
}
