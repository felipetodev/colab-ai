'use client'

import { Settings } from "lucide-react"
import type { Message } from "ai/react";
import { useChat } from "ai/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation";
import { type Chat } from "@/lib/types/chat"
import ChatInput from "./chat-input"
import ChatMessages from "./chat-messages"
import { Button } from "./ui/button"
import ChatSettings from "./chat-settings"
import ChatScrollAnchor from "./chat-scroll-anchor"
import Sidebar from "./sidebar";

type Props = {
  id: string
  chats: Chat[]
}

function Chat({ chats }: Props) {
  const [gotMessages, setGotMessages] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat>(chats[0])
  const router = useRouter()

  const { messages, input, stop, setInput, append, isLoading, setMessages } = useChat({
    onFinish: () => setGotMessages(true),
  })

  useEffect(() => {
    setMessages(selectedChat.messages)
  }, [selectedChat.messages, setMessages])

  const handleSend = async (value: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: value,
      role: 'user'
    }
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage]
    }

    setSelectedChat(updatedChat)
    setGotMessages(false)
    await append(newMessage)
  }

  useEffect(() => {
    if (!gotMessages) return

    const sendMessages = async () => {
      await fetch('/chats', {
        method: 'PUT',
        body: JSON.stringify({
          id: selectedChat.id,
          messages
        }),
      })
    }
    void sendMessages()
  }, [gotMessages])

  const handleNewChat = async () => {
    await fetch('/chats', {
      method: 'POST',
      body: JSON.stringify({
        id: crypto.randomUUID(),
        name: 'New Chat',
        messages: []
      }),
    })

    router.refresh()
  }

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat)
  }

  return (
    <div className="relative flex h-full overflow-hidden">
      <Sidebar
        chats={chats ?? []}
        handleNewChat={handleNewChat}
        handleSelectChat={handleSelectChat}
        selectedChat={selectedChat}
      />
      <div className="relative flex flex-col justify-between bg-zinc-400 dark:bg-zinc-900 w-full h-full">
        <div className="relative min-h-full w-full overflow-y-auto">
          <div className="relative flex min-h-[calc(100vh-90px-60px)] w-full flex-col pb-8">

            {selectedChat.messages.length === 0 ? (
              <ChatSettings />
            ) : (
              <header className="z-40 sticky top-0 flex h-[50px] justify-center items-center border-b px-4 py-3 bg-background/70">
                <div className="flex items-center space-x-2">
                  <h1>{selectedChat.name}</h1>
                  <Button className="w-8 h-8" size='icon' variant='ghost'>
                    <Settings className="h-5 w-5" />
                  </Button>
                </div>
              </header>
            )}

            <div className='flex flex-col pb-[60px]'>
              {messages?.map((message) => (
                <ChatMessages
                  content={message.content}
                  id={message.id}
                  key={message.id}
                  role={message.role}
                />
              ))}
              <ChatScrollAnchor trackVisibility={isLoading} />
            </div>

          </div>
          <ChatInput
            input={input}
            isLoading={isLoading}
            onSubmit={handleSend}
            setInput={setInput}
            stop={stop}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat
