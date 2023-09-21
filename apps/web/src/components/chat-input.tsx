import { useEffect, useRef } from "react"
import { StopCircle } from "lucide-react"
import type { UseChatHelpers } from "ai/react"
import Textarea from 'react-textarea-autosize'
import { useEnterSubmit } from "src/hooks/use-enter-submit"
import { Button } from "./ui/button"

interface Props
  extends Pick<UseChatHelpers, 'stop' | 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
}

function ChatInput({
  input,
  stop,
  setInput,
  onSubmit,
  isLoading
}: Props) {
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = useRef<HTMLTextAreaElement>(null)

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
        <form
          className="relative flex"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!input?.trim()) {
              return
            }
            setInput('')
            await onSubmit(input)
          }}
          ref={formRef}
        >
          <Textarea
            className="border min-h-[20px] max-h-[280px] w-full rounded-lg resize-none bg-transparent px-4 py-2.5 focus-within:outline-none text-sm pr-10"
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask ColabAI..."
            ref={inputRef}
            rows={1}
            spellCheck={false}
            tabIndex={0}
            value={input}
          />
          <Button
            className="absolute right-2 bottom-0 w-7 h-7 mb-2"
            disabled={isLoading || input === ''}
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
