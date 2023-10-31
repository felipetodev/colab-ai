import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { IconGitHub } from './ui/icons'
import { Badge } from './ui/badge'
import { createFileChunks } from 'src/app/actions/loaders'
import { SubmitButton } from 'src/app/actions/submit-button'
import { useToast } from './ui/use-toast'

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
  const { toast } = useToast()

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-2xl">
        <form action={async (formData: FormData) => {
          const { status } = await createFileChunks(formData) as { status: number }
          toast({
            variant: status >= 400 ? 'destructive' : 'success',
            description: status >= 400 ? 'Something went wrong' : 'File uploaded successfully'
          })
          setIsOpen(false)
        }}>
          <Tabs defaultValue="documents" onValueChange={(tab) => setActiveTab(tab as TabProps)} className='mb-4'>
            <AlertDialogHeader>
              <AlertDialogTitle>
                <TabsList>
                  <TabsTrigger value="documents">Upload file</TabsTrigger>
                  <TabsTrigger value="github">Connect GitHub repo</TabsTrigger>
                </TabsList>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <TabsContent className="text-sm" value="documents">
              <AlertDialogDescription className="mb-6">
                Upload file to use in chat conversation. Supported file extensions:
                {SUPPORTED_FILES.map((file) => (
                  <Badge key={file} variant='secondary' className='mx-1'>
                    {file}
                  </Badge>
                ))}
              </AlertDialogDescription>
              <div className="flex flex-col gap-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    name="name"
                    id="name"
                    placeholder="File name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="upload">Upload document</Label>
                  <Input
                    required
                    name="file"
                    id="upload"
                    multiple={false}
                    type="file"
                    accept=".pdf,.doc,.docs,.docx,.csv,.txt"
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent className="text-sm" value="github">
              <AlertDialogDescription className="mb-6">
                Sync files from a GitHub repo.
              </AlertDialogDescription>
              <div className="flex flex-col gap-y-4">
                <div className="flex items-end gap-x-2">
                  <div className="flex-1 space-y-2">
                    <Label className="mb-2" htmlFor="repository">Repository URL</Label>
                    <Input
                      name="repoUrl"
                      id="repository"
                      placeholder="https://github.com/vercel/ai"
                    // onChange={({ target }) => console.log({ url: target.value })}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      name="branchName"
                      id="branch"
                      placeholder="main"
                    // onChange={({ target }) => console.log({ branch: target.value })}
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
          <AlertDialogFooter>
            <AlertDialogCancel type="button" className={cn(buttonVariants({ variant: 'secondary' }))}>
              Cancel
            </AlertDialogCancel>
            <SubmitButton
              className="text-white bg-green-700 hover:bg-green-700/90"
            >
              {activeTab === 'documents' ? 'Upload' : 'Connect'}
            </SubmitButton>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog >
  )
}

export default DocumentDialog
