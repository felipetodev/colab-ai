import { useRef, useState, useTransition } from 'react'
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
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from './ui/button'
import { useToast } from './ui/use-toast'
import { deleteChat, updateChat } from 'src/app/actions/chat'
import { useRouter } from 'next/navigation'
import { Spinner } from './ui/icons'

type Props =
  | {
    type: 'delete'
    id: string
    isAgent?: boolean
    children: React.ReactNode
  } | {
    type: 'edit'
    activeName: string
    isAgent: boolean
    id: string
    children: React.ReactNode
  }

function ChatConversationDialog (props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRemovePending, startRemoveTransition] = useTransition()
  const { type, id, isAgent, children } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteChat = async (e: any) => {
    e.preventDefault()
    startRemoveTransition(async () => {
      await deleteChat(id)
      // if (result && 'error' in result) {
      //   do something
      // }

      router.refresh()
      router.push('/')
      toast({ variant: 'success', description: 'Chat deleted successfully' })
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {type === 'edit'
          ? (
            <>
              <DialogHeader>
                <DialogTitle>Edit chat</DialogTitle>
                <DialogDescription>
                  Update your chat name.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input ref={inputRef} name="name" placeholder={props.activeName} />
              </div>
            </>
            )
          : (
            <DialogHeader>
              <DialogTitle>Delete chat</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this chat?
              </DialogDescription>
            </DialogHeader>
            )}
        <DialogFooter>
          {type === 'delete'
            ? (
              <>
                <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
                  Cancel
                </DialogClose>
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
                <DialogClose className={cn(buttonVariants({ variant: 'secondary' }))}>
                  Cancel
                </DialogClose>
                <Button
                  disabled={isRemovePending}
                  className='text-white bg-green-700 hover:bg-green-700/90'
                  onClick={handleUpdateChat}
                >
                  {isRemovePending ? <Spinner className='animate-spin w-5 h-5' /> : 'Save'}
                </Button>
              </>
              )}
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default ChatConversationDialog
