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
  const [selectedDocuments, setSelectedDocuments] = useState<AgentProps['docsId']>(agent.docsId)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setSelectedDocuments(agent.docsId)
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
        selectedDocuments={selectedDocuments}
        handleSelectDocuments={setSelectedDocuments}
        handleCloseDialog={() => setIsOpen(false)}
      />
    </Dialog >
  )
}

export default AgentDialog
