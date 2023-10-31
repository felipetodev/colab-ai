import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
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
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setSelectedDocuments(agent.docsId)
        setIsOpen(open)
      }}
    >
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AgentDialogContent
        type={type}
        agent={agent}
        documents={documents}
        selectedDocuments={selectedDocuments}
        handleSelectDocuments={setSelectedDocuments}
        handleCloseDialog={() => setIsOpen(false)}
      />
    </AlertDialog>
  )
}

export default AgentDialog
