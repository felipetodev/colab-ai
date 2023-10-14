import type { NextRequest } from 'next/server'
import type { Message as VercelChatMessage } from 'ai'
import { StreamingTextResponse } from 'ai'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BytesOutputParser } from 'langchain/schema/output_parser'
import { PromptTemplate } from 'langchain/prompts'
import { RequestCookies } from '@edge-runtime/cookies'

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
  const body = await req.json() as { messages?: VercelChatMessage[] }
  const messages = body.messages ?? []
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage)
  const currentMessageContent = messages[messages.length - 1].content

  const cookies = new RequestCookies(req.headers) as any
  const cookie = cookies.get('invitedId')

  if (!cookie) return new Response('Unauthorized', { status: 401 })

  const prompt = PromptTemplate.fromTemplate(TEMPLATE)

  const llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    openAIApiKey: process.env.OPENAI_API_KEY,
    maxTokens: -1
  })

  const outputParser = new BytesOutputParser()

  const chain = prompt.pipe(llm).pipe(outputParser)

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    prompt: 'You are a very enthusiastic Colab-AI representative who loves to help people!',
    input: currentMessageContent
  })

  return new StreamingTextResponse(stream)
}
