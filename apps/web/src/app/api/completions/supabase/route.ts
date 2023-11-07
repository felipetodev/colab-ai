import type { Message as VercelChatMessage } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore, type SupabaseFilterRPCCall } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser, StringOutputParser } from 'langchain/schema/output_parser'
import { StreamingTextResponse } from 'ai'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { RunnableSequence } from 'langchain/schema/runnable'
import { type AgentProps } from '@/lib/types/agent'
import {
  type ChatWindowMessage,
  _formatChatHistoryAsMessages,
  createRetrievalChain,
  parsePrevMessages,
  responseChainPrompt
} from '@/lib/utils.langchain'

export const runtime = 'edge'

export async function POST (req: Request) {
  const body = await req.json() as {
    messages?: VercelChatMessage[]
    docsId?: AgentProps['docsId']
    prompt?: AgentProps['prompt']
    model?: AgentProps['model']
    temperature?: AgentProps['temperature']
    maxTokens?: AgentProps['maxTokens']
    references?: AgentProps['references']
  }
  const messages = body.messages ?? []
  const previousMessages = parsePrevMessages(messages.slice(0, -1))
  const currentMessageContent = messages[messages.length - 1].content

  const docId = body.docsId?.[0]
  // const agentName = body.name
  const { prompt: agentPrompt, model: agentModel, temperature, references } = body

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) {
    throw new Error('Something went wrong, please contact support')
  }

  const { data: settings } = await supabase.from('users')
    .select('supabaseUrl:supabase_url, supabaseSecretKey:supabase_secret_key, openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user.id)
    .limit(1)
    .maybeSingle()

  const {
    supabaseUrl: url,
    supabaseSecretKey: secretKey,
    openaiKey,
    openaiOrg = null
  } = settings ?? {}

  if (!url || !secretKey || !openaiKey) throw new Error('Missing supabase ⚡ credentials')

  const client = createClient(url, secretKey)

  const embeddings = new OpenAIEmbeddings(
    {
      openAIApiKey: openaiKey
    },
    openaiOrg ? { organization: openaiOrg } : {}
  )

  const funcFilter: SupabaseFilterRPCCall = (rpc) =>
    rpc
      .filter('metadata->>id', 'eq', docId)

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'embeddings',
    filter: funcFilter
  })

  // const docs = await vectorStore.similaritySearch(currentMessageContent, 4, funcFilter)

  const llm = new ChatOpenAI({
    modelName: agentModel,
    openAIApiKey: openaiKey,
    temperature,
    maxTokens: -1
  })

  const retrievalChain = createRetrievalChain(
    llm,
    vectorStore.asRetriever({
      k: references ?? 3
    }),
    previousMessages
  )

  const responseChain = RunnableSequence.from([
    responseChainPrompt,
    llm,
    new StringOutputParser()
  ])

  const fullChain = RunnableSequence.from([
    {
      question: (input) => input.question,
      chat_history: RunnableSequence.from([(input) => input.chat_history, _formatChatHistoryAsMessages]),
      context: RunnableSequence.from([(input) => {
        const formattedChatHistory = input.chat_history
          .map((message: ChatWindowMessage) => `${message.role.toUpperCase()}: ${message.content}`).join('\n')
        return {
          question: input.question,
          chat_history: formattedChatHistory
        }
      }, retrievalChain]),
      prompt: (input) => input.prompt
    },
    responseChain,
    new BytesOutputParser()
  ])

  const stream = await fullChain.stream({
    question: currentMessageContent,
    chat_history: previousMessages,
    prompt: agentPrompt
  })

  return new StreamingTextResponse(stream)
}
