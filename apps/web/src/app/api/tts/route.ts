import OpenAI from 'openai'

export const runtime = 'edge'

export async function POST (req: Request) {
  const { text } = await req.json()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice: 'alloy',
    input: text
  })

  const audioBlob = await response.arrayBuffer()

  return new Response(audioBlob, {
    headers: {
      'Content-Type': 'audio/mpeg'
    }
  })
}
