'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type ActionResponse = {
  message: string
  status: 'success' | 'destructive'
}

export const sendFeedback = async (formData: FormData): Promise<ActionResponse> => {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const feedback = formData.get('feedback')

  if (!feedback || typeof feedback !== 'string') {
    return {
      status: 'destructive',
      message: 'Feedback must be only plain text'
    }
  }

  const { error } = await resend.emails.send({
    from: 'Colab-AI [Feedback] <feedback@colab-ai.com>',
    to: 'colabot.org@gmail.com',
    reply_to: 'fe.ossandon.u@gmail.com',
    subject: 'Feedback',
    // improve this with https://react.email
    text: `
      Feedback from ${user?.email ?? 'Unknown user'}:
      ${feedback}
    `
  })

  return {
    message: error ? 'Oops! Something went wrong' : 'Thanks for your feedback!',
    status: error ? 'destructive' : 'success'
  }
}
