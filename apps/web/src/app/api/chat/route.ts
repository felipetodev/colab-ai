import type { NextRequest } from 'next/server';
import type { Message as VercelChatMessage } from 'ai';
import { StreamingTextResponse } from 'ai';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BytesOutputParser } from 'langchain/schema/output_parser';
import { PromptTemplate } from 'langchain/prompts';

export const runtime = 'edge';

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a helpful, friendly AI assistant.

{prompt}

Current conversation:
{chat_history}

User: {input}
AI:`;

const {
  SUPABASE_PROJECT_URL = "",
  SUPABASE_ANON_KEY = "",
  SUPABASE_SECRET_KEY = ""
} = process.env

export async function POST(req: NextRequest) {
  const body = await req.json() as { messages?: VercelChatMessage[], chatId?: string }
  const messages = body.messages ?? [];
  const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  const currentMessageContent = messages[messages.length - 1].content;

  // get chat data from supabase
  let payload: any
  try {
    const data = await fetch(`${SUPABASE_PROJECT_URL}/rest/v1/chats?id=eq.${body?.chatId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`
      }
    })

    const chat = await data.json()

    payload = {
      model: chat[0].model?.toLowerCase(),
      temperature: chat[0].temperature,
      max_tokens: chat[0].max_tokens,
      prompt: chat[0].prompt,
    }
  } catch (error) {
    payload = {}
  }

  const prompt = PromptTemplate.fromTemplate(TEMPLATE);

  const model = new ChatOpenAI({
    modelName: payload.model,
    openAIApiKey: process.env.OPENAI_API_KEY!,
    temperature: payload.temperature,
    maxTokens: payload.max_tokens,
  });

  const outputParser = new BytesOutputParser();

  const chain = prompt.pipe(model).pipe(outputParser);

  const stream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    prompt: payload.prompt ?? '',
    input: currentMessageContent,
  });

  return new StreamingTextResponse(stream);
}
