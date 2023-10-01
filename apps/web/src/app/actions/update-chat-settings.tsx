'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export const updateChat = async (formData: FormData) => {
  const id = formData.get('id')
  const agentId = formData.get('agentId')
  const { maxTokens = null, ...rest } = JSON.parse(formData.get('chatPreferences') as string) ?? {}

  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase.from('chats')
    .update({
      is_agent: !!agentId,
      agent_id: agentId,
      ...(maxTokens && { max_tokens: maxTokens }),
      ...rest
    })
    .eq('id', id)

  console.info({ data, error })

  revalidatePath('/')
}
