import { useEffect, useRef } from "react"
import { StopCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type Props = {
  stop: () => void
  isLoading: boolean
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  input: string
}

function ChatInput({
  handleInputChange,
  handleSubmit,
  isLoading,
  input
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])
  return (
    <div className="sticky bg-transparent bottom-6 w-full z-50 pt-8">
      {isLoading ? <div className="flex justify-center items-center w-full h-12">
          <Button onClick={stop} size='sm' variant='outline'>
            <StopCircle className="w-4 h-4 mr-2" /> Stop generating
          </Button>
        </div> : null}
      <div className="bg-background max-w-2xl mx-auto rounded-lg p-2 shadow-lg shadow-black/40">
        <form className="relative flex" onSubmit={handleSubmit}>
          <Input
            className="focus-visible:ring-transparent h-11 pr-12 truncate"
            onChange={handleInputChange}
            placeholder="Ask ColabAI..."
            ref={inputRef}
            value={input}
          />
          <Button
            className="absolute right-2 bottom-0 w-7 h-7 mb-2"
            disabled={isLoading}
            size='icon'
            type='submit'
            variant='secondary'
          >
            {/* v0.dev Icon */}
            <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M13.5 3V2.25H15V3V10C15 10.5523 14.5522 11 14 11H3.56062L5.53029 12.9697L6.06062 13.5L4.99996 14.5607L4.46963 14.0303L1.39641 10.9571C1.00588 10.5666 1.00588 9.93342 1.39641 9.54289L4.46963 6.46967L4.99996 5.93934L6.06062 7L5.53029 7.53033L3.56062 9.5H13.5V3Z" fill="currentColor" fillRule="evenodd" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
