import { useRef, useState } from 'react'

export function useTextToSpeech ({ text }: { text: string }) {
  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const handlePlay = async () => {
    setLoading(true)
    audioPlayerRef.current = new Audio()
    const response = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text })
    }).finally(() => setLoading(false))

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio()
    }

    audioPlayerRef.current.src = URL.createObjectURL(await response.blob())
    void audioPlayerRef.current.play()
    setIsPlaying(true)

    return await new Promise(resolve => {
      audioPlayerRef.current?.addEventListener('ended', () => {
        setIsPlaying(false)
        audioPlayerRef.current?.removeEventListener('ended', () => {})
        audioPlayerRef.current = null
        resolve(null)
      })
    })
  }

  const handleStop = () => {
    if (!audioPlayerRef.current) return
    audioPlayerRef.current.pause()
    audioPlayerRef.current.currentTime = 0
    setIsPlaying(false)
    audioPlayerRef.current = null
  }

  return {
    loadingAudio: loading,
    isPlaying,
    handlePlay,
    handleStop
  }
}
