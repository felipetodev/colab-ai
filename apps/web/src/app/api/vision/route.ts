import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST (req: Request) {
  const data = await req.formData()

  const file = data.get('file') as unknown as File
  const message = data.get('message') as string

  // transform file to base64
  const base64Image = await file.arrayBuffer()
    .then(buffer => Buffer.from(buffer).toString('base64'))

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-4-vision-preview',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: message
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,{${base64Image}}`
            }
          }
        ]
      }
    ],
    max_tokens: 4000 // 500
  })

  return NextResponse.json({ response: response.choices[0] })
}
