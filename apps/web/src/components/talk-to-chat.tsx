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
import { Input } from './ui/input'
import HoverLabel from './hover-label'
import { Badge } from './ui/badge'
import { IconHuggingFace } from './ui/icons'

type Props = {
  selectedChat: ChatProps
  isBeta?: boolean
  handleModalClose: () => void
  onUpdateSetting: (value: any) => void
}

function TalkToChat ({ isBeta, selectedChat, handleModalClose, onUpdateSetting }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleChatPreferences = async () => {
    if (isBeta) {
      // const file = formData.get('file')
      // console.log(file)
      handleModalClose()
    } else {
      const { status, message } = await updateChat({
        ...selectedChat,
        isAgent: false,
        agentId: null
      })
      onUpdateSetting({ key: 'agent', value: null })

      toast({
        variant: status,
        description: message
      })
      handleModalClose()
    }
  }

  return (
    <form>
      {isBeta && (
        <>
          <div className="flex items-center w-full mb-2">
            <HoverLabel>
              The document that will be used to train the model. Embeddings will be generated with Hugging Face Transformers Embeddings for this Open Beta
              <IconHuggingFace className='block w-6 h-6' />
            </HoverLabel>
            <h2 className="font-semibold">
              Input{' '}
              <Badge className='ml-1' variant='secondary'>Beta example</Badge>
            </h2>
          </div>
          <Input
            className='mb-4'
            name='file'
            type='file'
            accept='.pdf'
            multiple={false}
            // onChange={embedPDF}
          />
        </>
      )}
      <div className="flex items-center w-full mb-2">
        <HoverLabel>
          The model that will be used to generate responses.
        </HoverLabel>
        <h2 className="font-semibold">
          Model
        </h2>
      </div>
      <ModelSelector
        isBeta={isBeta}
        value={selectedChat?.model ?? ''}
        onChange={({ key, value }) => {
          onUpdateSetting({ key, value })
        }}
      />
      <div className="flex items-center w-full mb-2">
        <HoverLabel>
          This is your prompt. The model will use these as initial instructions to generate a response.
        </HoverLabel>
        <h2 className="font-semibold">
          Instructions
        </h2>
      </div>
      <Textarea
        className="resize-none mb-4 h-40"
        onChange={({ target }) => {
          onUpdateSetting({ key: 'prompt', value: target.value })
        }}
        placeholder="Write your instructions here..."
        value={selectedChat.prompt ?? ''}
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
                defaultValue={[selectedChat.temperature ?? 0.2]}
                onChange={(e) => {
                  onUpdateSetting({ key: 'temperature', value: e.value })
                }}
              />
              <MaxTokensSelector
                defaultValue={[selectedChat.maxTokens ?? 2000]}
                onChange={(e) => {
                  onUpdateSetting({ key: 'maxTokens', value: e.value })
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
