import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ChatProps } from './types/chat'

export function cn (...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createApiCompletion ({ chat }: { chat: ChatProps }) {
  /**
   * isAgent is true when chat has an agent assigned (already trained with docs)
   * vectorProvider is the option chosen in settings (pinecone, supabase, etc.)
   * dbStatus is the status of the database (on/off) chosen in settings
   */
  const { isAgent, user: { vectorProvider, dbStatus } = {} } = chat

  if (!isAgent || !vectorProvider || !dbStatus) {
    return '/api/chat'
  } else {
    return `/api/completions/${vectorProvider}`
  }
}

export function createBodyCompletion ({ chat }: { chat: ChatProps }) {
  const { isAgent, user: { vectorProvider, dbStatus } = {} } = chat

  if (!isAgent || !vectorProvider || !dbStatus) {
    return { chatId: chat?.id }
  } else {
    return {
      name: chat.agent.name,
      docsId: chat.agent?.docsId,
      prompt: chat.agent?.prompt,
      model: chat.agent?.model,
      temperature: chat.agent?.temperature,
      maxTokens: chat.agent?.maxTokens
      // references:
    }
  }
}
