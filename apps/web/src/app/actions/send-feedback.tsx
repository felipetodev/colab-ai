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

  const res = await fetch('https://formsubmit.co/ajax/fe.ossandon.u@gmail.com', {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      name: 'Colab-AI [Feedback]',
      email: 'colabot.org@gmail.com',
      message: feedback
    })
  })

  const json = await res.json()
  console.info(json)

  // await resend.emails.send({
  //   from: 'Colab-AI [Feedback] <onboarding@resend.dev>',
  //   to: 'colabot.org@gmail.com',
  //   reply_to: 'fe.ossandon.u@gmail.com',
  //   subject: 'Feedback',
  //   text: feedback
  // })
  return { success: true }
}
