import { useState } from 'react'
import ModelSelector from './model-selector'
import { Textarea } from './ui/textarea'
import { Button, buttonVariants } from './ui/button'
import { ChevronRightIcon } from '@radix-ui/react-icons'
import TemperatureSelector from './temperature-selector'
import MaxTokensSelector from './max-tokens-selector'
import { cn } from '@/lib/utils'
import { type ChatProps } from '@/lib/types/chat'
import { DialogClose } from '@radix-ui/react-dialog'
import { SubmitButton } from 'src/app/actions/submit-button'
import { updateChat } from 'src/app/actions/chat'
import { useToast } from './ui/use-toast'

type ChatPreferences = Pick<ChatProps, 'model' | 'prompt' | 'temperature' | 'maxTokens'>

type Props = {
  selectedChat: ChatProps
  handleModalClose: () => void
}

function TalkToChat ({ selectedChat, handleModalClose }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [chatPreferences, setChatPreferences] = useState<ChatPreferences>({
    model: selectedChat.model,
    prompt: selectedChat.prompt,
    temperature: selectedChat.temperature,
    maxTokens: selectedChat.maxTokens
  })
  const { toast } = useToast()

  const handleChatPreferences = async () => {
    console.log(chatPreferences)
    await updateChat({
      id: selectedChat.id,
      ...chatPreferences
    })

    toast({
      variant: 'success',
      description: 'Chat preferences updated successfully!'
    })
    handleModalClose()
  }

  return (
    <form>
      <div className="flex items-center w-full mb-2">
        <h2 className="font-semibold">
          Model
        </h2>
      </div>
      <ModelSelector
        value={chatPreferences?.model ?? ''}
        onChange={({ key, value }) => setChatPreferences({ ...chatPreferences, [key]: value })}
      />
      <div className="flex items-center w-full mb-2">
        <h2 className="font-semibold">
          Instructions
        </h2>
      </div>
      <Textarea
        className="resize-none mb-4 h-40"
        onChange={({ target }) => {
          setChatPreferences({ ...chatPreferences, prompt: target.value })
        }}
        placeholder="Write your instructions here..."
        value={chatPreferences.prompt ?? ''}
      />

      <div className="w-full">
        <Button
          type="button"
          className="flex items-center justify-start mb-4"
          onClick={() => setIsOpen(!isOpen)}
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
                defaultValue={[chatPreferences.temperature ?? 0.2]}
                onChange={(e) => {
                  setChatPreferences({ ...chatPreferences, temperature: e.value })
                }}
              />
              <MaxTokensSelector
                defaultValue={[chatPreferences.maxTokens ?? 2000]}
                onChange={(e) => {
                  setChatPreferences({ ...chatPreferences, maxTokens: e.value })
                }}
              />
            </div>
            )
          : null}
      </div>

      <footer className='flex justify-between pt-4'>
        <div />
        <div className='flex space-x-2'>
          <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          <SubmitButton formAction={handleChatPreferences}>
            Save preferences
          </SubmitButton>
        </div>
      </footer>
    </form>
  )
}

export default TalkToChat
