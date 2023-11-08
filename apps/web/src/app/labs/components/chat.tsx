'use client'

import { useChat } from 'ai/react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ChatInput from '@/components/chat-input'
import { CodeBlock } from '@/components/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api'
import { type Message } from 'ai'

const containerStyle = {
  width: '100%',
  height: '100%'
}

function Chat ({ initialMessages }: { initialMessages?: Message[] }) {
  const { messages, input, setInput, append, stop, isLoading } = useChat({
    api: '/api/completions/assistant',
    initialMessages
  })

  const handleSend = async (value: string) => {
    await append({
      id: crypto.randomUUID(), // use nanoId
      content: value,
      role: 'user'
    })
  }

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyBm6z49otVXeHModcvUA6AoAYKErVCXPCI'
  })

  return (
    <div className="grid grid-cols-2 h-[calc(100vh-57px)] px-20">
      <div className='relative border-r'>
        {messages.length === 0 && (
          <div className='flex flex-col justify-center items-center h-full mx-auto max-w-md gap-y-2'>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!input?.trim()) {
                  return
                }
                setInput('')
                await handleSend(input)
              }}
            >
              <Label id='entry' htmlFor='entry' className="text-3xl">
                Where would you like to go?
              </Label>
              <Input
                id='entry'
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder='Start typing or upload a file...'
              />
              <button>
                Send
              </button>
            </form>
          </div>
        )}

        {messages.length > 0 && (
          <div className='absolute inset-0 h-full'>
            <div className='h-[calc(100vh-57px-92px)] overflow-y-auto pt-10'>
              {
                messages.map((message) => (
                  <div key={message.id}>
                    <div className='flex space-x-2 prose dark:prose-invert mx-auto prose-h3:m-0'>
                      <span>
                        {message.role === 'assistant' ? '🤖' : '👨‍🦱'}
                      </span>
                      <h3 className='font-semibold'>
                        {message.role.toUpperCase()}:
                      </h3>
                    </div>

                    <div className="flex-1 mt-5 mb-12 space-y-2 overflow-hidden">
                      <MemoizedReactMarkdown
                        className="prose break-words dark:prose-invert prose-p:leading-normal prose-pre:p-0 mx-auto"
                        components={{
                          p ({ children }) {
                            return <p className="mb-2 last:mb-0">{children}</p>
                          },
                          code ({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className ?? '')

                            if (inline) {
                              return (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              )
                            }

                            return (
                              <CodeBlock
                                key={crypto.randomUUID()}
                                language={(match?.[1]) ?? ''}
                                value={String(children).replace(/\n$/, '')}
                                {...props}
                              />
                            )
                          }
                        }}
                        remarkPlugins={[remarkGfm, remarkMath]}
                      >
                        {message.content}
                      </MemoizedReactMarkdown>
                    </div>
                  </div>
                ))
              }
            </div>

            <ChatInput
              input={input}
              isLoading={isLoading}
              onSubmit={handleSend}
              setInput={setInput}
              stop={stop}
            />
          </div>
        )}
      </div>
      <div className='pt-[0.5px] pb-[92px] '>
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={{ lat: -33.4372, lng: -70.6506 }}
            zoom={8}
          />
        )}
      </div>
    </div>
  )
}

export default Chat
