export const runtime = 'edge'

export async function POST (req: Request) {
  const { text } = await req.json()
  // ID of voice to be used for speech
  const voiceId = '21m00Tcm4TlvDq8ikWAM'

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVEN_LABS_API_KEY!
    },
    body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
  })
  const audioBlob = await response.blob()

  return new Response(audioBlob, {
    headers: {
      'Content-Type': 'audio/mpeg'
    }
  })
}
