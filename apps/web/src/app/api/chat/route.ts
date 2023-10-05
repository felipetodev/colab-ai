import type { NextRequest } from 'next/server'
import type { Message as VercelChatMessage } from 'ai'
import { StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { PromptTemplate } from 'langchain/prompts'
import { RequestCookies } from '@edge-runtime/cookies'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { type ChatProps } from '@/lib/types/chat'

export const runtime = 'edge'

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`
}

const TEMPLATE = `You are a helpful, friendly AI assistant.

{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`

export async function POST (req: NextRequest) {
  const body = await req.json() as { messages?: VercelChatMessage[], chatId?: string }
  const messages = body.messages ?? []
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const cookies = new RequestCookies(req.headers) as any
  const supabase = createServerComponentClient({ cookies: () => cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) {
    throw new Error('Something went wrong, please contact support')
  }

  const { data: chat } = await supabase.from('chats')
    .select('model, temperature, maxTokens:max_tokens, prompt, user:user_id(openaiKey:openai_key, openaiOrg:openai_org)')
    .eq('id', body?.chatId)

  const {
    user: secrets,
    model: modelName,
    temperature,
    maxTokens,
    prompt: promptText
  } = chat?.[0] ?? {} as ChatProps

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const model = new ChatOpenAI({
    modelName,
    openAIApiKey: secrets.openaiKey,
    temperature,
    maxTokens
  }, {
    ...(secrets?.openAiorg && {
      organization: secrets?.openAiorg
    })
  })

  const outputParser = new BytesOutputParser()

  const chain = prompt.pipe(model).pipe(outputParser)

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    prompt: promptText ?? '',
    input: currentMessageContent
  })

  return new StreamingTextResponse(stream)
}
