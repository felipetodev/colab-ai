import { useState } from 'react'
import { DialogClose } from '@radix-ui/react-dialog'
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
import type { DocumentProps } from '@/lib/types/document'
import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { useToast } from './ui/use-toast'
import { Spinner } from './ui/icons'

type Props = {
  userSettings?: {
    id: string
    dbStatus: boolean
    vectorProvider: 'pinecone' | 'supabase' | null
  }
  document: DocumentProps
  children: React.ReactNode
}

// do on the server
const parseContent = (content: DocumentProps['content']) => {
  return content.reduce((acc, chunk) => {
    return chunk.pageContent ? (acc + chunk.pageContent) : acc
  }, '')
    .trim()
}

function DocumentPreviewDialog ({ userSettings, document, children }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(document.name)
  const { toast } = useToast()

  const handleEmbedding = async () => {
    if (!userSettings || !userSettings?.dbStatus || !userSettings?.vectorProvider) {
      return toast({
        variant: 'destructive',
        description: 'You must connect to a database and a vector provider before you can generate embeddings.'
      })
    }
    setIsLoading(true)
    await fetch(`/api/embeddings/${userSettings.vectorProvider}`, {
      method: 'POST',
      body: JSON.stringify({
        name: name || document.name,
        docId: document.id,
        content: document.content,
        database: userSettings.vectorProvider
      })
    })
      .finally(() => setIsLoading(false))

    setIsOpen(false)
  }

  const handleDeleteEmbedding = async () => {
    if (!userSettings || !userSettings.dbStatus || !userSettings.vectorProvider) {
      return toast({
        variant: 'destructive',
        description: 'You must connect to a database and a vector provider before you can generate embeddings.'
      })
    }
    setIsLoading(true)
    await fetch(`/api/embeddings/${userSettings.vectorProvider}`, {
      method: 'DELETE',
      body: JSON.stringify({
        docId: document.id,
        ids: document.embeddedIds
      })
    })
      .finally(() => setIsLoading(false))

    setIsOpen(false)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setName(document.name)
        }
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            {document.name}
            <Badge className='ml-2' variant='secondary'>{document.type}</Badge>
            {document.database !== null && (
              <Badge className='ml-2' variant='secondary'>trained in {document.database}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {document.isTrained
              ? (
                <>Your document is ready to be used by an agent.</>
                )
              : <>You must train this file before you can use it in an agent.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={({ target }) => setName(target.value)}
              placeholder="File name"
              value={name}
            />
          </div>
          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              className="min-h-[400px]"
              disabled
              id="content"
              placeholder="Write your instructions here..."
              readOnly
              value={parseContent(document.content)}
            />
          </div>
        </div>
        <DialogFooter className="!justify-between">
          {document.isTrained
            ? <Button onClick={handleDeleteEmbedding} variant='destructive'>
              Delete
            </Button>
            : <div />}
          <div className="flex sm:space-x-2">
            <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
              Cancel
            </DialogClose>
            {document.isTrained
              ? (
                <Button className="bg-green-700 text-white hover:bg-green-700/90">
                  Save Changes
                </Button>
                )
              : (
                <Button
                  disabled={isLoading}
                  className="bg-green-700 text-white hover:bg-green-700/90"
                  onClick={handleEmbedding}
                >
                  {isLoading ? <Spinner className='w-6 h-6 animate-spin' /> : 'Generate Embeddings'}
                </Button>
                )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default DocumentPreviewDialog
