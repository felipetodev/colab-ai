import type { Message } from 'ai/react'
import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']

export type Chat = {
  id: Tables<'chats'>['id']
  name: Tables<'chats'>['name']
  messages: Tables<'chats'>['messages']
  folderId: Tables<'chats'>['folder_id']
  model?: Tables<'chats'>['model']
  temperature?: Tables<'chats'>['temperature']
  maxTokens?: Tables<'chats'>['max_tokens']
  prompt?: Tables<'chats'>['prompt']
  isAgent?: Tables<'chats'>['is_agent']
  user?: Tables<'chats'>['user_id']
}

export type ChatProps = Omit<Chat, 'messages' | 'user'> & {
  messages: Message[]
  user?: {
    id: string
    openaiKey: string
    openaiOrg: string
    vectorProvider: 'pinecone' | 'supabase' | any
    dbStatus: boolean
  } | any
  agent?: {
    id: string
    docsId: string[]
    prompt: string
  } | any
}
