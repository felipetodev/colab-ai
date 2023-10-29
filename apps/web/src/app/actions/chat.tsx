/* eslint-disable @typescript-eslint/naming-convention */
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { type ChatProps } from '@/lib/types/chat'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

export const createChat = async (payload: ChatProps) => {
  const {
    id,
    name,
    prompt,
    messages,
    temperature = 0.2,
    model = 'gpt-3.5-turbo',
    folderId: folder_id,
    maxTokens: max_tokens = 2000
  } = payload

  const message = messages[0]?.content

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  await supabase
    .from('chats')
    .insert({
      id,
      model,
      messages,
      folder_id,
      max_tokens,
      temperature,
      user_id: user.id,
      ...prompt && { prompt },
      ...message
        ? { name: message.split(' ', 20).join(' ') }
        : { name }
    })

  revalidatePath('/chat')
  redirect(`/chat/${id}`)
}

export const updateChat = async (payload: Partial<ChatProps & { agentId: any }>): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  const {
    id,
    folderId: folder_id,
    isAgent: is_agent = false,
    maxTokens: max_tokens,
    user: _user,
    agent: _agent,
    model,
    agentId,
    ...rest
  } = payload

  const { status } = await supabase.from('chats')
    .update({
      is_agent,
      ...folder_id && { folder_id },
      ...max_tokens && { max_tokens },
      ...(agentId && { is_agent: !!agentId }),
      ...(agentId && { agent_id: agentId }),
      // if its a new chat, set the model to the default
      ...model ? { model } : { model: 'gpt-3.5-turbo' },
      ...rest
    })
    .eq('id', id)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error updating chat' : 'Chat updated successfully',
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const deleteChat = async (id: ChatProps['id']) => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  await supabase.from('chats')
    .delete()
    .eq('id', id)

  revalidatePath('/')
}
