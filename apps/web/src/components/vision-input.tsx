import { useRef } from 'react'
import { PaperclipIcon } from 'lucide-react'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

type Props = {
  file: File | null
  handleFile: (file: File | null) => void
}

function VisionInput ({ file, handleFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <>
    <TooltipProvider>
      <Tooltip delayDuration={100} open={!!file}>
        <TooltipTrigger asChild>
          <Button
            className="absolute left-10 bottom-0 w-7 h-7 mb-2"
            size='icon'
            type='button'
            variant='secondary'
            onClick={() => inputRef.current?.click()}
          >
            <PaperclipIcon className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' sideOffset={16}>
          <p>Write a prompt for the image before submit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider >
      <input
        multiple={false}
        ref={inputRef}
        className='hidden'
        type="file"
        name="vision"
        id="vision"
        onChange={({ target }) => {
          const file = target.files?.[0]
          if (!file) return handleFile(null)
          handleFile(file)
        }}
      />
    </>
  )
}

export default VisionInput
