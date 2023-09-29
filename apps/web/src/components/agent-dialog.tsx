import { useState } from 'react'
import {
  Dialog,
  DialogTrigger
} from '@/components/ui/dialog'
import type { AgentProps } from '@/lib/types/agent'
import type { DocumentProps } from '@/lib/types/document'
import AgentDialogContent from './agent-dialog-content'

type Props = {
  type: 'create' | 'update'
  agent: AgentProps
  documents: DocumentProps[]
  children: React.ReactNode
}

function AgentDialog ({ type, agent, documents, children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [agentState, setAgentState] = useState<AgentProps>(agent)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setAgentState(agent)
        setIsOpen(open)
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <AgentDialogContent
        type={type}
        agent={agent}
        documents={documents}
        agentState={agentState}
        handleCloseDialog={() => setIsOpen(false)}
        handleAgentState={({ key, value }) => (
          setAgentState((prev) => ({
            ...prev,
            [key]: value
          }))
        )}
      />
    </Dialog >
  )
}

export default AgentDialog
