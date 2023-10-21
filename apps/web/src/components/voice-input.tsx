import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { MicIcon, Square } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'

type Props = {
  isLoading: boolean
  onRecording: (e: boolean) => void
  onRecordingComplete: (blob: Blob) => void
}

function VoiceInput ({ isLoading, onRecording, onRecordingComplete }: Props) {
  const [showTooltip, setShowTooltip] = useState(true)
  const {
    isRecording,
    recordingBlob,
    startRecording,
    stopRecording
  } = useAudioRecorder()

  useEffect(() => {
    if (recordingBlob != null) {
      onRecordingComplete(recordingBlob)
    }
  }, [recordingBlob])

  const handleRecording = () => {
    if (isRecording) {
      setShowTooltip(false)
      stopRecording()
    } else {
      setShowTooltip(true)
      onRecording(true)
      startRecording()
    }
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100} open={showTooltip}>
        <TooltipTrigger asChild>
          <Button
            className="absolute left-2 bottom-0 w-7 h-7 mb-2"
            disabled={isLoading}
            size='icon'
            type='button'
            variant='secondary'
            onClick={handleRecording}
          >
            {isRecording ? <Square className="w-4 h-4" /> : <MicIcon className="w-4 h-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side='top' sideOffset={16}>
          <p>Click to send recording</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default VoiceInput
