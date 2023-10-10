'use server'

// import { Resend } from 'resend'

// const resend = new Resend(process.env.RESEND_API_KEY)

export const sendFeedback = async (formData: FormData) => {
  const feedback = formData.get('feedback')

  if (typeof feedback !== 'string') {
    return {
      error: 'Feedback must be only plain text'
    }
  }

  // await resend.emails.send({
  //   from: 'Colab-AI [Feedback] <onboarding@resend.dev>',
  //   to: 'colabot.org@gmail.com',
  //   reply_to: 'fe.ossandon.u@gmail.com',
  //   subject: 'Feedback',
  //   text: feedback
  // })
  return { success: true }
}
