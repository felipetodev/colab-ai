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

const TEMPLATE = `Given the following instructions answer the question using only this instructions:
{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`

export async function POST (req: NextRequest) {
  const body = await req.json() as {
    messages?: VercelChatMessage[]
    model?: string
    chatId?: string
    prompt?: string
    temperature?: number
  }

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
    .limit(1)
    .maybeSingle()

  const {
    user: secrets,
    model,
    temperature,
    // @deprecated
    // maxTokens
    prompt: promptText
  } = chat ?? {} as ChatProps

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const llm = new ChatOpenAI({
    modelName: model ?? body?.model ?? 'gpt-3.5-turbo',
    openAIApiKey: secrets?.openaiKey ?? process.env.OPENAI_API_KEY,
    temperature: temperature ?? body?.temperature ?? 0.2,
    maxTokens: -1
  }, {
    ...(secrets?.openAiorg && {
      organization: secrets.openAiorg
    })
  })

  const outputParser = new BytesOutputParser()

  const chain = prompt.pipe(llm).pipe(outputParser)

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    prompt: promptText ?? body?.prompt ?? 'You are a very enthusiastic Colab-AI representative who loves to help people!',
    input: currentMessageContent
  })

  return new StreamingTextResponse(stream)
}
