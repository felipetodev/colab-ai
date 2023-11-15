import { useEffect, useRef, useState } from 'react'
import { StopCircle } from 'lucide-react'
import Textarea from 'react-textarea-autosize'
import { useEnterSubmit } from '../hooks/use-enter-submit'
import { Button } from './ui/button'
import { type UseChatHelpers, type Message } from 'ai/react'
import { IconEnter, Spinner } from './ui/icons'
import { createTranscription } from 'src/app/actions/loaders'
import dynamic from 'next/dynamic'
import VisionInput from './vision-input'

const VoiceInput = dynamic(async () => await import('./voice-input'))

interface Props
  extends Pick<UseChatHelpers, 'stop' | 'input' | 'setInput'> {
  onSubmit: (value: string) => Promise<void>
  isLoading: boolean
  handleVisionMessage?: (messages: Message) => void
}

function ChatInput ({
  input,
  stop,
  setInput,
  onSubmit,
  isLoading,
  handleVisionMessage
}: Props) {
  const [isRecording, setIsRecording] = useState(false)
  const { formRef, onKeyDown } = useEnterSubmit()
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const onRecordingComplete = async (blob: Blob) => {
    const formData = new FormData()
    formData.append('file', blob, 'audio.wav')
    formData.append('model', 'whisper-1')
    // formData.append('language', 'es')

    const { transcription, error } = await createTranscription(formData)

    if (error) return setIsRecording(false)

    setInput(transcription)
    setIsRecording(false)
  }

  return (
    <div className="sticky bg-transparent bottom-6 w-full z-40 pt-8">
      {isLoading
        ? <div className="flex justify-center items-center w-full h-12">
          <Button onClick={stop} size='sm' variant='outline'>
            <StopCircle className="w-4 h-4 mr-2" /> Stop generating
          </Button>
        </div>
        : null}
      <div className="bg-background max-w-2xl mx-auto rounded-lg p-2 shadow-lg shadow-black/40">
        <form
          className="relative flex"
          onSubmit={async (e) => {
            e.preventDefault()

            if (file) {
              setIsRecording(true)
              try {
                const formData = new FormData()
                formData.append('file', file)
                formData.append('message', input)

                const res = await fetch('/api/vision', {
                  method: 'POST',
                  body: formData
                })
                const { response } = await res.json()
                const message = response.message as Message
                return handleVisionMessage ? handleVisionMessage(message) : null
              } catch { } finally {
                setFile(null)
                setIsRecording(false)
                setInput('')
              }
              return
            }

            if (!input?.trim()) {
              return
            }
            setInput('')
            await onSubmit(input)
          }}
          ref={formRef}
        >
          <Textarea
            className="border min-h-[20px] max-h-[280px] w-full rounded-lg resize-none bg-transparent py-2.5 focus-within:outline-none text-sm pl-20 pr-12"
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={isRecording ? 'Loading...' : 'Ask ColabAI...'}
            ref={inputRef}
            rows={1}
            spellCheck={false}
            tabIndex={0}
            value={input}
          />
          <VoiceInput
            isLoading={isLoading}
            onRecording={setIsRecording}
            onRecordingComplete={onRecordingComplete}
          />
          <VisionInput
            file={file}
            handleFile={setFile}
          />
          <Button
            className="absolute right-2 bottom-0 w-7 h-7 mb-2"
            disabled={isLoading || input === ''}
            size='icon'
            type='submit'
            variant='secondary'
          >
            {(isLoading || isRecording)
              ? <Spinner className="w-4 h-4 animate-spin" />
              : <IconEnter />
            }
          </Button>
        </form>
      </div>
    </div>
  )
}

export default ChatInput
