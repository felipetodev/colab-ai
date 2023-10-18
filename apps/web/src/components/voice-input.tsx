import { useEffect } from 'react'
import { Button } from './ui/button'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { MicIcon, Square } from 'lucide-react'

type Props = {
  isLoading: boolean
  onRecording: (e: boolean) => void
  onRecordingComplete: (blob: Blob) => void
}

function VoiceInput ({ isLoading, onRecording, onRecordingComplete }: Props) {
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
      stopRecording()
    } else {
      onRecording(true)
      startRecording()
    }
  }

  return (
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
  )
}

export default VoiceInput
