import { DialogClose } from '@radix-ui/react-dialog'
import { useState } from 'react'
import { ChevronRightIcon, ImagePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AgentProps } from '@/lib/types/agent'
import type { DocumentProps } from '@/lib/types/document'
import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import ModelSelector from './model-selector'
import TemperatureSelector from './temperature-selector'
import MaxTokensSelector from './max-tokens-selector'
import { Label } from './ui/label'
import DocumentSelector from './document-selector'

type Props = {
  agent: AgentProps
  documents: DocumentProps[]
  children: React.ReactNode
}

function AgentDialog ({ agent, documents, children }: Props) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [agentState, setAgentState] = useState<AgentProps>(agent)

  const onUpdateSelectedChat = ({
    key,
    value
  }: { key: 'name' | 'model' | 'prompt' | 'temperature' | 'maxTokens' | 'docsId', value: any }) => {
    setAgentState((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const image = files[0]
    const formData = new FormData()
    formData.append('avatar', image)

    // show avatar preview before upload
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(image)

    // upload avatar to storage reference agent
  }

  const handleUpdateAgent = async () => {
    await fetch('/api/agents', {
      method: 'PUT',
      body: JSON.stringify(agentState)
    })
  }

  return (
    <Dialog onOpenChange={(open) => {
      if (!open) {
        setAvatarPreview(null)
        setAgentState(agent)
      }
    }}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[780px]">
        <DialogHeader>
          <DialogTitle>
            [Agent]: {agent.name}
          </DialogTitle>
          <DialogDescription>
            Create your agent assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Agent Name"
              value={agentState.name}
              onChange={({ target }) => onUpdateSelectedChat({ key: 'name', value: target.value })}
            />
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <Label htmlFor="dropzone-file">Avatar</Label>
            <Label className="flex flex-col items-center justify-center w-20 h-20 border rounded cursor-pointer overflow-hidden" htmlFor="dropzone-file">
              {avatarPreview
                ? (
                  <img
                    alt="avatar"
                    className="block h-full w-full object-cover"
                    src={avatarPreview}
                  />
                  )
                : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  )}
              <input
                accept="image/jpeg, image/png, image/webp, image/jpg"
                className="hidden"
                id="dropzone-file"
                onChange={handleAvatar}
                type="file"
              />
            </Label>
          </div>

          <div className="space-y-2">
            <DocumentSelector
              agentState={agentState}
              documents={documents}
              onChange={onUpdateSelectedChat}
            />
            <pre className='text-xs'>
              {documents.map(e => agentState.docsId.includes(e.id) ? e.name : null).filter(e => e).join(', ')}
            </pre>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              className="h-40"
              id="prompt"
              placeholder="Write your instructions here..."
              value={agentState.prompt}
              onChange={({ target }) => onUpdateSelectedChat({ key: 'prompt', value: target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <ModelSelector onChange={onUpdateSelectedChat} />
          </div>

          <div className="w-full mt-2">
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
                    defaultValue={[agentState.temperature ?? 0.2]}
                    onChange={onUpdateSelectedChat}
                  />
                  <MaxTokensSelector
                    defaultValue={[agentState.maxTokens ?? 2000]}
                    onChange={onUpdateSelectedChat}
                  />
                </div>
                )
              : null}
          </div>
        </div>
        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          <Button onClick={handleUpdateAgent} className="text-white bg-green-700 hover:bg-green-700/90">
            Save Agent
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default AgentDialog
