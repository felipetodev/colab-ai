'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useAtBottom } from '../hooks/use-at-bottom'

interface ChatScrollAnchorProps {
  trackVisibility?: boolean
}

function ChatScrollAnchor({ trackVisibility }: ChatScrollAnchorProps) {
  const isAtBottom = useAtBottom()
  const { ref, entry, inView } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: '0px 0px -150px 0px'
  })

  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start'
      })
    }
  }, [inView, entry, isAtBottom, trackVisibility])

  return <div className="h-0.5 w-full" ref={ref} />
}

export default ChatScrollAnchor
