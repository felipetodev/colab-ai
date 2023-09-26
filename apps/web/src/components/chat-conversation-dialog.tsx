import { DialogClose } from "@radix-ui/react-dialog"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./ui/button"

type Props =
  | {
    type: 'delete'
    onClick: () => void
    children: React.ReactNode
  } | {
    type: 'edit'
    activeName: string
    onClick: (name: string) => void
    children: React.ReactNode
  }

function ChatConversationDialog(props: Props) {
  const { type, onClick, children } = props
  const [newChatName, setNewChatName] = useState('')
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        {type === 'edit' ? (
          <>
            <DialogHeader>
              <DialogTitle>Edit chat</DialogTitle>
              <DialogDescription>
                Update your chat name.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input onChange={({ target }) => setNewChatName(target.value)} placeholder={props.activeName} />
            </div>
          </>
        ) : (
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat?
            </DialogDescription>
          </DialogHeader>
        )}
        <DialogFooter>
          {type === 'delete' ? (
            <>
              <DialogClose className={cn(buttonVariants({ variant: "secondary" }))}>
                Cancel
              </DialogClose>
              <Button onClick={onClick} variant="destructive">Delete</Button>
            </>
          ) : (
            <>
              <DialogClose className={cn(buttonVariants({ variant: "secondary" }))}>
                Cancel
              </DialogClose>
              <Button onClick={() => onClick(newChatName)}>Save</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default ChatConversationDialog
