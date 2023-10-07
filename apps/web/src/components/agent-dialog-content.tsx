import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DialogClose } from '@radix-ui/react-dialog'
import { ChevronRightIcon, ImagePlus, X } from 'lucide-react'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import ModelSelector from './model-selector'
import TemperatureSelector from './temperature-selector'
import MaxTokensSelector from './max-tokens-selector'
import { Label } from './ui/label'
import DocumentSelector from './document-selector'
import { Badge } from './ui/badge'
import { type AgentProps } from '@/lib/types/agent'
import { type DocumentProps } from '@/lib/types/document'
import { createAgent } from 'src/app/actions/create-agent'
import { SubmitButton } from '../app/actions/submit-button'

type Props = {
  type: 'create' | 'update'
  agent: AgentProps
  documents: DocumentProps[]
  selectedDocuments: AgentProps['docsId']
  handleSelectDocuments: (e: AgentProps['docsId']) => void
  handleCloseDialog: () => void
}

function AgentDialogContent ({
  type,
  agent,
  documents,
  selectedDocuments,
  handleSelectDocuments,
  handleCloseDialog
}: Props) {
  const [isOpenSettings, setIsOpenSettings] = useState(false)
  const router = useRouter()

  const avatarPreview = false // TODO: add avatar preview

  const docsSelected = documents.filter(d => selectedDocuments.includes(d.id))
  return (
    <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[780px]">
      <DialogHeader>
        {type === 'create' && (
          <DialogTitle>
            Create New Agent
          </DialogTitle>
        )}
        {type === 'update' && (
          <>
            <DialogTitle>
              [Agent]: {agent.name}
            </DialogTitle>
            <DialogDescription>
              Create your agent assistant.
            </DialogDescription>
          </>
        )}
      </DialogHeader>
      <form
        action={async (formData) => {
          if (type === 'create') {
            // const folderId = agent.folderId
            await createAgent(type, formData)
          } else if (type === 'update') {
            formData.append('agentId', agent.id)
            await createAgent(type, formData)
          }

          router.refresh()
          handleCloseDialog()
        }}
      >
        <div className="flex flex-col gap-y-3">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name='agentName'
              placeholder="Agent Name"
              defaultValue={agent.name}
            />
          </div>

          <div className="space-y-2 flex flex-col justify-center">
            <Label className='max-w-max' htmlFor="dropzone-file">Avatar</Label>
            <Label className="bg-neutral-800/20 flex flex-col items-center justify-center w-20 h-20 border rounded cursor-pointer overflow-hidden" htmlFor="dropzone-file">
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
                name="avatar"
                multiple={false}
                accept="image/jpeg, image/png, image/webp, image/jpg"
                className="hidden"
                id="dropzone-file"
                // onChange={({ target }) => {}}
                type="file"
              />
            </Label>
          </div>

          <div className="space-y-2">
            <DocumentSelector
              selectedDocuments={selectedDocuments}
              documents={documents}
              onChange={handleSelectDocuments}
            />
            <div>
              {docsSelected.map(doc => (
                <Badge
                  key={doc.id}
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    handleSelectDocuments(selectedDocuments.filter(d => d !== doc.id))
                  }}
                >
                  {doc.name}
                  <X className='ml-2 w-3 h-3' />
                </Badge>
              ))}
              <input type="hidden" name="docsId" value={selectedDocuments} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              className="h-40"
              name="prompt"
              id="prompt"
              placeholder="Write your instructions here..."
              defaultValue={agent.prompt}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <ModelSelector value={agent.model ?? ''} />
          </div>

          <div className="w-full mt-2">
            <Button
              type="button"
              className="flex items-center justify-start"
              onClick={() => setIsOpenSettings(!isOpenSettings)}
              variant='secondary'
            >
              <span>Show Advanced Settings</span>
              <ChevronRightIcon
                className={cn('w-4 h-4 ml-1', {
                  'transform rotate-90': isOpenSettings
                })} />
            </Button>
            {isOpenSettings
              ? (
                <div className="flex flex-col gap-6 my-6">
                  <TemperatureSelector
                    defaultValue={[agent.temperature ?? 0.2]}
                  />
                  <MaxTokensSelector
                    defaultValue={[agent.maxTokens ?? 2000]}
                  />
                </div>
                )
              : null}
          </div>
        </div>
        <DialogFooter className='mt-4'>
          <DialogClose type="button" className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          {type === 'create' && (
            <SubmitButton>
              Create Agent
            </SubmitButton>
          )}
          {type === 'update' && (
            <SubmitButton>
              Save Agent
            </SubmitButton>
          )}
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

export default AgentDialogContent
