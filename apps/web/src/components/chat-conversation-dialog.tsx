import { useRef, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'
import { useToast } from './ui/use-toast'
import { deleteChat, updateChat } from 'src/app/actions/chat'
import { useRouter } from 'next/navigation'
import { FileEditIcon, Trash2Icon } from 'lucide-react'
import { Spinner } from './ui/icons'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogDescription,
  AlertDialogTitle
} from './ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'

type Props =
  | {
    type: 'delete'
    id: string
    isAgent?: boolean
  } | {
    type: 'edit'
    activeName: string
    isAgent: boolean
    id: string
  }

function ChatConversationDialog (props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRemovePending, startRemoveTransition] = useTransition()
  const { type, id, isAgent } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteChat = async (e: any) => {
    e.preventDefault()
    startRemoveTransition(async () => {
      const { status, message } = await deleteChat(id)
      // if (result && 'error' in result) {
      //   do something
      // }

      setIsOpen(false)
      router.refresh()
      router.push('/')
      toast({ variant: status, description: message })
    })
  }

  const handleUpdateChat = async (e: any) => {
    e.preventDefault()
    if (!inputRef.current) return setIsOpen(false)

    const name = inputRef.current.value
    if (!name) return
    startRemoveTransition(async () => {
      const { message, status } = await updateChat({ id, name, isAgent })

      setIsOpen(false)
      router.refresh()
      toast({ variant: status, description: message })
    })
  }

  return (
    <>
      {type === 'edit'
        ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsOpen(true)} className="w-7 h-7" size='icon' variant="ghost">
                  <FileEditIcon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Edit chat name
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          )
        : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => setIsOpen(true)} className="w-7 h-7" size='icon' variant="ghost">
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Delete chat
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          )}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-xl">
          {type === 'edit'
            ? (
              <>
                <AlertDialogHeader>
                  <AlertDialogTitle>Edit chat</AlertDialogTitle>
                  <AlertDialogDescription>
                    Update your chat name.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-4 py-4">
                  <Input ref={inputRef} name="name" placeholder={props.activeName} className='truncate' />
                </div>
              </>
              )
            : (
              <AlertDialogHeader>
                <AlertDialogTitle>Delete chat</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this chat?
                  This will permanently delete your chat message and remove your
                  data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              )}
          <AlertDialogFooter>
            {type === 'delete'
              ? (
                <>
                  <AlertDialogCancel disabled={isRemovePending} className={cn(buttonVariants({ variant: 'secondary' }))}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    disabled={isRemovePending}
                    variant='destructive'
                    onClick={handleDeleteChat}
                  >
                    {isRemovePending ? <Spinner className='animate-spin w-5 h-5' /> : 'Delete'}
                  </Button>
                </>
                )
              : (
                <>
                  <AlertDialogCancel disabled={isRemovePending} className={cn(buttonVariants({ variant: 'secondary' }))}>
                    Cancel
                  </AlertDialogCancel>
                  <Button
                    disabled={isRemovePending}
                    className='text-white bg-green-700 hover:bg-green-700/90'
                    onClick={handleUpdateChat}
                  >
                    {isRemovePending ? <Spinner className='animate-spin w-5 h-5' /> : 'Save'}
                  </Button>
                </>
                )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default ChatConversationDialog
