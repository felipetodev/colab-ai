import { useState } from "react"
import { DialogClose } from "@radix-ui/react-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"

type Props = {
  document: any
  children: React.ReactNode
}

const parseContent = (content: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return JSON.parse(content).reduce((acc, chunk) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return chunk.pageContent ? (acc + chunk.pageContent) : acc
  }, '')
    .trim()
}

function DocumentPreviewDialog({ document, children }: Props) {
  const [name, setName] = useState(document.name)
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {document.name}
          </DialogTitle>
          <DialogDescription>
            {document.isTrained ? (
              <>Your document is ready to be used by an agent.</>
            ) : <>You must train this file before you can use it in an agent.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              onChange={({ target }) => setName(target.name)}
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
          {document.isTrained ? <Button variant='destructive'>
              Delete
            </Button> : <div />}
          <div className="sm:space-x-2">
            <DialogClose className={cn(buttonVariants({ variant: "secondary" }))}>
              Cancel
            </DialogClose>
            {document.isTrained ? (
              <Button className="bg-green-700 text-white hover:bg-green-700/90">
                Save Changes
              </Button>
            ) : (
              <Button className="bg-green-700 text-white hover:bg-green-700/90">
                Generate Embeddings
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}

export default DocumentPreviewDialog;