/* eslint-disable @typescript-eslint/naming-convention */
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { type ChatProps } from '@/lib/types/chat'

export const createChat = async (payload: ChatProps) => {
  const {
    id,
    name,
    messages,
    temperature,
    folderId: folder_id,
    maxTokens: max_tokens
  } = payload

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'User not found' }

  const { status, error } = await supabase
    .from('chats')
    .insert({
      id,
      name,
      messages,
      folder_id,
      max_tokens,
      temperature,
      user_id: user.id
    })

  revalidatePath('/')
  return { status, error }
}
