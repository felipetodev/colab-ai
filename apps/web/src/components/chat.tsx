'use client'

import { useEffect, useState } from 'react'
import { useChat } from 'ai/react'
import ChatInput from './chat-input'
import ChatMessages from './chat-messages'
import ChatSettings from './chat-settings'
import ChatScrollAnchor from './chat-scroll-anchor'
import ChatSettingsDialog from './chat-settings-dialog'
import { Badge } from './ui/badge'
import { createChat, updateChat } from 'src/app/actions/chat'
import { createApiCompletion, createBodyCompletion } from '@/lib/utils'
import { type Message } from 'ai/react'
import { type ChatProps } from '@/lib/types/chat'
import { type AgentProps } from '@/lib/types/agent'

type Props = {
  id: string
  user: { name: string, username: string, avatarUrl: string } | null
  agents: AgentProps[] | null
  selectedChat: ChatProps
  isBeta?: boolean
  isNewChat?: boolean
}

function Chat ({ user, selectedChat, agents, isBeta, isNewChat }: Props) {
  const [chat, setChat] = useState<ChatProps>(selectedChat)
  const [gotMessages, setGotMessages] = useState(false)

  const { messages, input, stop, setInput, append, isLoading, setMessages } = useChat({
    api: isBeta
      ? '/api/beta'
      : createApiCompletion({ chat: isNewChat ? chat : selectedChat }),
    body: createBodyCompletion({ chat: isNewChat ? chat : selectedChat }),
    onFinish: () => { setGotMessages(true) },
    initialMessages: selectedChat.messages
  })

  const handleSend = async (value: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(), // use nanoId
      content: value,
      role: 'user'
    }

    setGotMessages(false)
    await append(newMessage)
  }

  useEffect(() => {
    if (!gotMessages || isBeta) return

    const sendMessages = async () => {
      isNewChat
        ? await createChat({
          ...chat,
          messages
        })
        : await updateChat({
          ...selectedChat,
          messages
        })
    }
    void sendMessages()
  }, [gotMessages])

  const onUpdateSetting = ({ key, value }: any) => {
    setChat(prev => ({
      ...prev,
      ...key === 'agent' && { isAgent: !!value },
      [key]: value
    }))
  }

  const handleVisionMessage = async (message: Message) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content: input,
      role: 'user'
    }
    setMessages([
      ...messages,
      newMessage,
      {
        id: crypto.randomUUID(),
        role: message.role,
        content: message.content
      }
    ])
  }

  const handleDrop = (e: any) => {
    e?.preventDefault()
    if (e.dataTransfer) {
      const file = e.dataTransfer.files[0] as unknown as File
      // create obj url
      const url = URL.createObjectURL(file)
      // generate preview in markdown
      const preview = `![${file.name}](${url})`
      // add preview to messages
      const newMessage: Message = {
        id: crypto.randomUUID(),
        content: preview,
        role: 'user'
      }
      setMessages([
        ...messages,
        newMessage
      ])
    }
    e.target.style.background = 'none'
  }

  const allowDrop = (e: any) => {
    e.preventDefault()
  }

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541'
  }

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none'
  }

  return (
    <div className="relative flex flex-col justify-between bg-zinc-400 dark:bg-zinc-900 w-full h-full">
      <div className="relative min-h-full w-full overflow-y-auto">
        <div
          onDrop={(e) => handleDrop(e)}
          onDragOver={allowDrop}
          onDragEnter={highlightDrop}
          onDragLeave={removeHighlight}
          className="relative flex min-h-[calc(100vh-90px-60px)] w-full flex-col pb-8"
        >
          {messages?.length === 0
            ? (
              <ChatSettings
                isBeta={isBeta}
                onUpdateSetting={onUpdateSetting}
                selectedChat={chat}
              />
              )
            : (
              <>
                <header className="z-40 backdrop-blur-sm sticky top-0 flex h-[50px] justify-center items-center border-b px-4 py-3 bg-background/70">
                  <div className="flex items-center space-x-2">
                    <h1 className='max-w-[30ch] truncate'>{selectedChat.name}</h1>
                    {(selectedChat.agent && selectedChat?.isAgent) && (
                      <Badge variant='secondary'>{selectedChat.agent.name}</Badge>
                    )}
                    <ChatSettingsDialog
                      isBeta={isBeta}
                      agents={agents ?? []}
                      selectedChat={selectedChat}
                    />
                  </div>
                </header>
                <div className='flex flex-col pb-[60px]'>
                  {messages?.map((message) => (
                    <ChatMessages
                      user={user}
                      agentAvatarUrl={selectedChat.agent ? selectedChat.agent.avatarUrl : ''}
                      agentName={selectedChat.agent ? selectedChat.agent.name : ''}
                      content={message.content}
                      id={message.id}
                      key={message.id}
                      role={message.role}
                    />
                  ))}
                  <ChatScrollAnchor trackVisibility={isLoading} />
                </div>
              </>
              )}
        </div>
        <ChatInput
          input={input}
          isLoading={isLoading}
          onSubmit={handleSend}
          setInput={setInput}
          stop={stop}
          handleVisionMessage={handleVisionMessage}
        />
      </div>
    </div>
  )
}

export default Chat
