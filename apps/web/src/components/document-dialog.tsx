import { DialogClose } from '@radix-ui/react-dialog'
import { useState } from 'react'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { IconGitHub } from './ui/icons'
import { Badge } from './ui/badge'

const SUPPORTED_FILES = [
  '.pdf',
  '.doc',
  '.docs',
  '.docx',
  '.csv',
  '.txt'
  // '.xls'
]

type Props = {
  children: React.ReactNode
}

type TabProps = 'documents' | 'github'

function DocumentDialog ({ children }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabProps>('documents')
  const [fileName, setFileName] = useState('')
  const [fileLists, setFileLists] = useState<FileList | null>(null)

  const handleInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName('')
    const files = e.target.files

    if (!files) return
    setFileLists(files)
  }

  const onFileSubmit = async (tab: TabProps) => {
    if (tab === 'documents') {
      if (!fileLists) return
      const file = fileLists[0]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', fileName || file.name)
      formData.append('type', file.type)

      await fetch('/api/chunk', {
        method: 'POST',
        body: formData
      })
      setIsOpen(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) {
          setFileName('')
          setFileLists(null)
        }
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <Tabs defaultValue="documents" onValueChange={(tab) => setActiveTab(tab as TabProps)}>
          <DialogHeader>
            <DialogTitle>
              <TabsList>
                <TabsTrigger value="documents">Upload file</TabsTrigger>
                <TabsTrigger value="github">Connect GitHub repo</TabsTrigger>
              </TabsList>
            </DialogTitle>
          </DialogHeader>
          <TabsContent className="text-sm" value="documents">
            <DialogDescription className="mb-6">
              Upload file to use in chat conversation. Supported file extensions:
              {SUPPORTED_FILES.map((file) => (
                <Badge key={file} variant='secondary' className='mx-1'>
                  {file}
                </Badge>
              ))}
            </DialogDescription>
            <div className="flex flex-col gap-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  onChange={({ target }) => setFileName(target.value)}
                  placeholder="File name"
                  value={(fileName || fileLists?.[0]?.name) ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload">Upload document</Label>
                <Input
                  id="upload"
                  multiple={false}
                  onChange={handleInputFile}
                  type="file"
                  accept=".pdf,.doc,.docs,.docx,.csv,.txt"
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent className="text-sm" value="github">
            <DialogDescription className="mb-6">
              Sync files from a GitHub repo.
            </DialogDescription>
            <div className="flex flex-col gap-y-4">
              <div className="flex items-end gap-x-2">
                <div className="flex-1 space-y-2">
                  <Label className="mb-2" htmlFor="repository">Repository URL</Label>
                  <Input
                    id="repository"
                    placeholder="https://github.com/vercel/ai"
                  />
                </div>
                <div className="w-24">
                  <Input
                    id="branch"
                    placeholder="main"
                  />
                </div>
              </div>
              <div className="flex flex-col cursor-not-allowed space-y-2">
                <span>Connect your GitHub account to sync private repositories. (available soon)</span>
                <div>
                  <Button disabled size='sm' variant='outline'>
                    <IconGitHub className="-ml-0.5 mr-2 h-5 w-5" />
                    Authorize GitHub
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
            Cancel
          </DialogClose>
          <Button
            className="text-white bg-green-700 hover:bg-green-700/90"
            onClick={async () => await onFileSubmit(activeTab)}
          >
            {activeTab === 'documents' ? 'Upload' : 'Connect'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default DocumentDialog
