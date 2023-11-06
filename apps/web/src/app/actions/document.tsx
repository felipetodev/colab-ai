'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { type DocumentProps } from '@/lib/types/document'

type ActionResponse = {
  message?: string
  status?: 'success' | 'destructive'
  error?: string
}

export const deleteDocument = async ({ id }: { id: DocumentProps['id'] }): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (user === null || !id) return { error: 'Unauthorized' }

  const { status } = await supabase.from('documents')
    .delete()
    .eq('id', id)

  revalidatePath('/')

  return {
    message: status >= 400 ? 'Error deleting document' : 'Document deleted',
    status: status >= 400 ? 'destructive' : 'success'
  }
}
