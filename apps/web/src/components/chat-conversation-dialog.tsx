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
import { buttonVariants } from './ui/button'
import { SubmitButton } from 'src/app/actions/submit-button'
import { updateChat } from 'src/app/actions/update-chat-settings'
import { useToast } from './ui/use-toast'

type Props =
  | {
    type: 'delete'
    id: string
    children: React.ReactNode
  } | {
    type: 'edit'
    activeName: string
    id: string
    children: React.ReactNode
  }

function ChatConversationDialog (props: Props) {
  const { type, id, children } = props
  const { toast } = useToast()

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <form action={async (formData: FormData) => {
          formData.set('id', id)
          await updateChat(type, formData)
          toast({
            variant: 'success',
            description: `Chat ${type === 'edit' ? 'updated' : 'deleted'} successfully`
          })
        }}>
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
                  <Input name="name" placeholder={props.activeName} />
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
                  <DialogClose type="button" className={cn(buttonVariants({ variant: 'secondary' }))}>
                    Cancel
                  </DialogClose>
                  <SubmitButton variant='destructive'>
                    Delete
                  </SubmitButton>
                </>
                )
              : (
                <>
                  <DialogClose type="button" className={cn(buttonVariants({ variant: 'secondary' }))}>
                    Cancel
                  </DialogClose>
                  <SubmitButton className='text-white bg-green-700 hover:bg-green-700/90'>
                    Save
                  </SubmitButton>
                </>
                )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}

export default ChatConversationDialog
