import { type AgentProps } from '@/lib/types/agent'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { type ChatProps } from '@/lib/types/chat'
import { useState } from 'react'
import { Button, buttonVariants } from './ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { updateChat } from 'src/app/actions/update-chat-settings'
import { Badge } from './ui/badge'

type TalkAgentProps = {
  agents: AgentProps[]
  selectedChat: ChatProps
  handleModalClose: () => void
}

function TalkToAgent ({ agents, selectedChat, handleModalClose }: TalkAgentProps) {
  const [agentSelected, setAgentSelected] = useState<ChatProps['agent']>(selectedChat.agent ?? null)

  return (
    <form
      className="w-full space-y-4"
      action={async (formData) => {
        await updateChat(formData)
        handleModalClose()
      }}
    >
      <h3 className="mt-6 font-medium">
        Select an agent to talk to with:
      </h3>
      <input type="hidden" name="id" value={selectedChat?.id} />
      <input type="hidden" name="agentId" value={agentSelected?.id} />
      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id} className="flex flex-row items-center justify-between rounded-lg border py-2 px-4">
            <div className="space-y-0.5 space-x-2">
              <Label htmlFor={agent.id}>{agent.name}</Label>
            </div>
            <Switch
              checked={agentSelected?.id === agent.id}
              onCheckedChange={() => setAgentSelected({
                id: agent.id,
                docsId: agent.docsId
              })}
              id={agent.id}
            />
          </div>
        ))}
      </div>

      <span className='block text-xs py-1'>
        This agent has <Badge variant='secondary'>{agentSelected?.docsId.length ?? 0}</Badge> trained documents.
      </span>

      <footer className='flex justify-between pt-4'>
        <div />
        <div className='space-x-2'>
          <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          <Button type='submit'>
            Save preferences
          </Button>
        </div>
      </footer>
    </form>
  )
}

export default TalkToAgent
