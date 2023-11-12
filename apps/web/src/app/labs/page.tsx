import OpenAI from 'openai'
import { cookies } from 'next/headers'
import Chat from './components/chat'
import { type Message } from 'ai'
import { type ThreadMessagesPage } from 'openai/resources/beta/threads/messages/messages'

export default async function Labs () {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })

  const threadId = cookies().get('threads')?.value
  console.log({ threadId: !!threadId })

  if (!threadId) return <Chat /> // return without previous messages

  const messages = await openai.beta.threads.messages.list(threadId, {
    order: 'asc'
  })

  const parsedMessages = (messages: ThreadMessagesPage): Message[] => {
    if (!messages.data) return []
    return messages.data.map(message => {
      return {
        id: message.id,
        // @ts-expect-error 😉😉😉 lol
        content: message.content[0]?.text?.value,
        role: message.role
      }
    })
  }

  // console.log(messages)

  return <Chat initialMessages={parsedMessages(messages)} />
}
