'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createSupabaseUrl } from '@/lib/utils'
import { validateNewAgent, validateUpdateAgent } from '@/lib/schemas/agent'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

export const newAgent = async (formData: FormData): Promise<ActionResponse> => {
  const avatar = formData.get('avatar')
  const avatarUrl = formData.get('avatarUrl')

  const result = validateNewAgent({
    name: formData.get('agentName'),
    prompt: formData.get('prompt'),
    temperature: formData.get('temperature') ?? 0.2,
    max_tokens: formData.get('maxTokens') ?? 4000,
    model: formData.get('llmModel'),
    docs_id: JSON.parse(formData.get('docsId') as string)
  })

  if (!result.success) return { message: 'Error creating agent', status: 'destructive' }

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  const agentId = crypto.randomUUID()

  // refact this, try to use a relation from supabase or something similar
  let imgUrl = ''
  if ((avatar as File)?.size > 0 && !avatarUrl) {
    const { data } = await supabase.storage
      .from('agents-avatar')
      .upload(agentId, avatar as File)

    imgUrl = data?.path ?? ''
  }

  const { status } = await supabase
    .from('agents')
    .insert({
      id: agentId,
      user_id: user.id,
      folder_id: null, // refact this
      ...(imgUrl && { avatar_url: createSupabaseUrl(imgUrl) }),
      ...result.data
    })

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error creating agent' : `Agent ${result.data.name} created successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const updateAgent = async (formData: FormData): Promise<ActionResponse> => {
  const avatar = formData.get('avatar')
  const avatarUrl = formData.get('avatarUrl')

  const result = validateUpdateAgent({
    name: formData.get('agentName'),
    prompt: formData.get('prompt'),
    temperature: formData.get('temperature'),
    max_tokens: formData.get('maxTokens'),
    model: formData.get('llmModel'),
    docs_id: JSON.parse(formData.get('docsId') as string),
    agentId: formData.get('agentId')
  })

  if (!result.success) return { message: 'Error updating agent', status: 'destructive' }

  const { agentId, temperature, max_tokens: maxTokens, ...restData } = result.data

  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  // refact this, try to use a relation from supabase or something similar
  let imgUrl = ''
  if ((avatar as File)?.size > 0 && !avatarUrl) {
    const { data } = await supabase.storage
      .from('agents-avatar')
      .upload(agentId, avatar as File)

    imgUrl = data?.path ?? ''
    // console.log(data, error)
  }

  const { status } = await supabase
    .from('agents')
    .update({
      ...restData,
      ...(imgUrl && { avatar_url: createSupabaseUrl(imgUrl) }),
      ...(temperature && { temperature }),
      ...(maxTokens && { max_tokens: maxTokens })
    })
    .eq('id', agentId)

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error updating agent' : `Agent ${restData.name} updated successfully`,
    status: status >= 400 ? 'destructive' : 'success'
  }
}

export const removeAgent = async (agentId: string): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null) return { error: 'Unauthorized' }

  const { status } = await supabase
    .from('agents')
    .delete()
    .eq('id', agentId)

  revalidatePath('/')
  return {
    message: status >= 400 ? 'Error deleting agent' : 'Agent deleted successfully',
    status: status >= 400 ? 'destructive' : 'success'
  }
}
