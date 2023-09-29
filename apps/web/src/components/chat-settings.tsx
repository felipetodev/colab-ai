import { useState } from 'react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatProps } from '@/lib/types/chat'
import ModelSelector from './model-selector'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import { Textarea } from './ui/textarea'
import TemperatureSelector from './temperature-selector'
import MaxTokensSelector from './max-tokens-selector'
import { Button } from './ui/button'

type Props = {
  selectedChat: ChatProps
  onUpdateSelectedChat: (value: { key: 'model' | 'temperature' | 'maxTokens' | 'prompt', value: any }) => void
}

function ChatSettings ({ selectedChat, onUpdateSelectedChat }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="bg-background w-full max-w-2xl mx-auto border rounded-lg mt-20 shadow-lg shadow-black/40">
      <div className="flex flex-col items-center justify-center">
        <header className="flex w-full justify-center pt-6">
          <h1 className="text-xl font-semibold">
            Chat Settings
          </h1>
        </header>

        <div className="flex flex-col items-center w-full p-6">
          <div className="flex items-center w-full mb-2">
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <InfoCircledIcon className="w-4 h-4 mr-1" />
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                className="w-[260px] text-sm"
                side="left"
              >
                The model that will be used to generate responses.
              </HoverCardContent>
            </HoverCard>
            <h2 className="font-semibold">
              Model
            </h2>
          </div>
          {/* Input Selector */}
          <ModelSelector onChange={onUpdateSelectedChat} />
          <div className="flex items-center w-full mb-2">
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <InfoCircledIcon className="w-4 h-4 mr-1" />
              </HoverCardTrigger>
              <HoverCardContent
                align="start"
                className="w-[260px] text-sm"
                side="left"
              >
                This is your prompt. The model will use these as initial instructions to generate a response.
              </HoverCardContent>
            </HoverCard>
            <h2 className="font-semibold">
              Instructions
            </h2>
          </div>
          <Textarea
            className="resize-none mb-4 h-40"
            onChange={({ target }) => {
              onUpdateSelectedChat({ key: 'prompt', value: target.value })
            }}
            placeholder="Write your instructions here..."
            value={selectedChat.prompt ?? ''}
          />

          <div className="w-full">
            <Button
              className="flex items-center justify-start mb-4"
              onClick={() => { setIsOpen(!isOpen) }}
              variant='secondary'
            >
              <span>Show Advanced Settings</span>
              <ChevronRightIcon
                className={cn('w-4 h-4 ml-1', {
                  'transform rotate-90': isOpen
                })} />
            </Button>
            {isOpen
              ? (
              <div className="flex flex-col gap-6">
                <TemperatureSelector
                  defaultValue={[selectedChat.temperature ?? 0.2]}
                  onChange={onUpdateSelectedChat}
                />
                <MaxTokensSelector
                  defaultValue={[selectedChat.maxTokens ?? 2000]}
                  onChange={onUpdateSelectedChat}
                />
              </div>
                )
              : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatSettings
