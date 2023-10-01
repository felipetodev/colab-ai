import type { Message as VercelChatMessage } from 'ai'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore, type SupabaseFilterRPCCall } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { PromptTemplate } from 'langchain/prompts'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { StreamingTextResponse } from 'ai'

// const formatMessage = (message: VercelChatMessage) => {
//   return `${message.role}: ${message.content}`
// }

const {
  SUPABASE_SECRET_KEY,
  SUPABASE_PROJECT_URL,
  SUPABASE_ANON_KEY
} = process.env

export const runtime = 'edge'

const TEMPLATE = `{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`

export async function POST (req: Request) {
  const body = await req.json() as { messages?: VercelChatMessage[], userId?: string, docsId?: string[], prompt?: string }
  const messages = body.messages ?? []
  // const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const userId = body.userId
  const docId = body.docsId?.[0]
  const agentPrompt = body.prompt

  // Get settings from supabase (sdk doesn't work in edge)
  let payload: null | any = null
  try {
    const data = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
      }
    })

    const user = await data.json()

    payload = {
      openaiKey: user[0].openai_key,
      openaiOrg: user[0].openai_org
    }
  } catch (error) {
    console.error(error)
  }

  const {
    openaiKey,
    openaiOrg = null
  } = payload // refact

  const client = createClient(SUPABASE_PROJECT_URL!, SUPABASE_SECRET_KEY!) // this keys should be came from the user

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

  const funcFilterA: SupabaseFilterRPCCall = (rpc) =>
    rpc
      .filter('metadata->>id', 'eq', docId)
  // .filter("metadata.loc->pageNumber::int", "eq", 2)

  const docs = await store.similaritySearch(currentMessageContent, 4, funcFilterA)
  const content = docs.map(({ pageContent }) => pageContent).join('\n\n')

  console.log(content)

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
