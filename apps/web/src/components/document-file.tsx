import { Settings, FileText } from 'lucide-react'
import type { DocumentProps } from '@/lib/types/document'
import { Button } from './ui/button'
import DocumentPreviewDialog from './document-preview-dialog'

type Props = {
  document: DocumentProps
  user: {
    id: string
    dbStatus: boolean
    vectorProvider: 'pinecone' | 'supabase' | null
  }
}

function DocumentFile ({ document, user }: Props) {
  return (
    <DocumentPreviewDialog
      user={user}
      document={document}
    >
      <div
        className='flex items-center p-1 m-2 rounded-md hover:bg-secondary/40'
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            // onOpenAgent();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="mr-2 p-2 rounded-md">
          <FileText />
        </span>
        <span className="text-sm truncate w-full mr-2">
          {document.name}
        </span>
        <div className="ml-auto flex">
          <Button className="w-7 h-7" size='icon' variant="ghost">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </DocumentPreviewDialog>
  )
}

export default DocumentFile
