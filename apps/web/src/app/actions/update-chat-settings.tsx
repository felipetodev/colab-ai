'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export const updateChat = async (type: 'edit' | 'delete', formData: FormData) => {
  const id = formData.get('id')
  const name = formData.get('name')
  const agentId = formData.get('agentId')
  const { maxTokens = null, ...rest } = JSON.parse(formData.get('chatPreferences') as string) ?? {}

  const supabase = createServerActionClient({ cookies })

  if (type === 'edit') {
    const { status } = await supabase.from('chats')
      .update({
        ...(name && { name }),
        ...(agentId && { is_agent: !!agentId }),
        ...(agentId && { agent_id: agentId }),
        ...(maxTokens && { max_tokens: maxTokens }),
        ...rest
      })
      .eq('id', id)

    revalidatePath('/')
    return { status }
  }

  if (type === 'delete') {
    const { status } = await supabase.from('chats')
      .delete()
      .eq('id', id)

    revalidatePath('/')
    return { status }
  }
}
