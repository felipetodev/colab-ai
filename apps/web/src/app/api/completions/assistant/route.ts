import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { StreamingTextResponse, type Message } from 'ai'
import OpenAI from 'openai'

const assistantID = 'asst_4Gvk7WJuvcSqPuzUciiGSw8j'

export async function POST (req: NextRequest) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const { messages } = await req.json() as { messages: Message[] }
  const currentMessage = messages[messages.length - 1].content

  const cookieStore = cookies()
  const hasCookie = cookieStore.has('threads')

  if (!hasCookie) {
    const thread = await openai.beta.threads.create({})
    cookies().set('threads', thread.id, { secure: true })
  }

  const threadId = cookies().get('threads')?.value

  if (!threadId) {
    return NextResponse.json({ cookieStore: 'no thread found, please contact support' })
  }

  // ✨ Step 3: Add a Message to a Thread
  await openai.beta.threads.messages.create(
    threadId,
    {
      role: 'user',
      content: currentMessage
    }
  )

  // ✨ Step 4: Run the Assistant
  const run = await openai.beta.threads.runs.create(
    threadId,
    {
      assistant_id: assistantID
      // instructions: 'And what about Brasil?'
    }
  )

  // ✨ Step 5: Display the Assistant's Response
  await openai.beta.threads.runs.retrieve(
    threadId,
    run.id
  )

  // https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
  const promise = async (threadId: string, runId: string) => {
    return await new Promise((resolve, reject) => {
      const timeout = setInterval(async () => {
        const run = await openai.beta.threads.runs.retrieve(threadId, runId)
        console.log(run)
        const state = run.status
        if (state === 'completed') {
          console.log('success ✨✨✨')
          clearInterval(timeout)
          resolve(run)
        } else if (state === 'cancelled' || state === 'expired' || state === 'failed') {
          clearInterval(timeout)
          reject(new Error(`Error processing thread: ${state}, Thread ID: ${threadId}, Run ID: ${runId}`))
        }
      }, 500)
    })
  }

  await promise(threadId, run.id)

  const response = await openai.beta.threads.messages.list(threadId)
  const messageData = response.data ?? []

  // @ts-expect-error 😉😉😉 lol
  const message = messageData?.[0].content[0]?.text?.value ?? 'no message found lol'

  return new StreamingTextResponse(message)
}
