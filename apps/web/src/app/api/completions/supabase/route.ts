import type { Message as VercelChatMessage } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore, type SupabaseFilterRPCCall } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { StreamingTextResponse } from 'ai'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { type AgentProps } from '@/lib/types/agent'

export const runtime = 'edge'

const TEMPLATE = `You are a representative who loves to help people!
Given the following sections from the documentation (preceded by a section id), answer the question using only that information, outputted in Markdown format.

Here is some context which might contain valuable information to answer the question:
{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`

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
  // const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const docId = body.docsId?.[0]
  // const agentName = body.name
  const { prompt: agentPrompt, model: agentModel, temperature, maxTokens } = body

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) {
    throw new Error('Something went wrong, please contact support')
  }

  const { data: settings } = await supabase.from('users')
    .select('supabaseUrl:supabase_url, supabaseSecretKey:supabase_secret_key, openaiKey:openai_key, openaiOrg:openai_org')
    .eq('id', user?.id)

  const {
    supabaseUrl: url,
    supabaseSecretKey: secretKey,
    openaiKey,
    openaiOrg = null
  } = settings?.[0] ?? {}

  if (!url || !secretKey || !openaiKey) throw new Error('Missing supabase ⚡ credentials')

  const client = createClient(url, secretKey)

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

  const funcFilter: SupabaseFilterRPCCall = (rpc) =>
    rpc
      .filter('metadata->>id', 'eq', docId)
  // .filter("metadata.loc->pageNumber::int", "eq", 2)

  const docs = await store.similaritySearch(currentMessageContent, 4, funcFilter)

  const content = docs.map(({ pageContent, metadata }) => {
    if (!metadata?.loc?.pageNumber) return pageContent
    return `-----\nPAGE ${metadata?.loc?.pageNumber}\n\n${pageContent}\nEND PAGE ${metadata?.loc?.pageNumber}\n-----`
  }).join('\n\n')

  console.log(content)

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const model = new ChatOpenAI({
    modelName: agentModel,
    openAIApiKey: openaiKey,
    temperature,
    maxTokens
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
