import { type AgentProps } from '@/lib/types/agent'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { type ChatProps } from '@/lib/types/chat'
import { useState } from 'react'
import { buttonVariants } from './ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'
import { updateChat } from 'src/app/actions/chat'
import { Badge } from './ui/badge'
import { useToast } from './ui/use-toast'
import { SubmitButton } from 'src/app/actions/submit-button'

type TalkAgentProps = {
  agents: AgentProps[]
  selectedChat: ChatProps
  handleModalClose: () => void
}

function TalkToAgent ({ agents, selectedChat, handleModalClose }: TalkAgentProps) {
  const [agentSelected, setAgentSelected] = useState<ChatProps['agent']>(selectedChat.agent ?? null)
  const { toast } = useToast()

  const handleUpdateChat = async () => {
    if (!agentSelected) {
      return toast({
        variant: 'destructive',
        description: 'Please select an agent to talk to with'
      })
    }

    const { message, status } = await updateChat({
      id: selectedChat.id,
      agentId: agentSelected?.id
    })

    toast({
      variant: status,
      description: message
    })
    handleModalClose()
  }

  return (
    <form className="w-full space-y-4">
      <h3 className="mt-6 font-medium">
        Select an agent to talk to with:
      </h3>
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
        <div className='flex space-x-2'>
          <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          <SubmitButton formAction={handleUpdateChat}>
            Save preferences
          </SubmitButton>
        </div>
      </footer>
    </form>
  )
}

export default TalkToAgent
