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
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

type Props = {
  children: React.ReactNode
}

function DocumentDialog({ children }: Props) {
  const [fileName, setFileName] = useState('')
  const [fileLists, setFileLists] = useState<FileList | null>(null)

  const handleInputFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName('')
    const files = e.target.files

    if (!files) return
    setFileLists(files)
  }

  const handleClick = async () => {
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
  }

  return (
    <Dialog
      onOpenChange={e => {
        if (!e) {
          setFileName('')
          setFileLists(null)
        }
      }}
    >
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Upload document
          </DialogTitle>
          <DialogDescription>
            Upload file to use in chat conversation. accepted files: .pdf, .doc, .docx
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-3">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              multiple={false}
              onChange={({ target }) => setFileName(target.value)}
              placeholder="File name"
              value={(fileName || fileLists?.[0]?.name) ?? ''}
            />
          </div>
          <div>
            <Label htmlFor="upload">Upload document</Label>
            <Input id="upload" onChange={handleInputFile} type="file" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose className={cn(buttonVariants({ variant: "secondary" }))}>
            Cancel
          </DialogClose>
          <Button className="text-white bg-green-700 hover:bg-green-700/90" onClick={handleClick}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default DocumentDialog
