/* eslint-disable @typescript-eslint/no-unused-vars */
import { User, Copy } from 'lucide-react'
import type { Message } from 'ai/react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { MemoizedReactMarkdown } from './markdown'
import { CodeBlock } from './codeblock'

interface Props extends Message {
  user: { name: string, username: string, avatarUrl: string } | null
}

function ChatMessages ({ user, content, role }: Props) {
  return (
    <div className={cn({
      'bg-secondary/50': role === 'user',
      'bg-secondary/10': role === 'assistant'
    })}>
      <div className="group max-w-2xl mx-auto">
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <div className="bg-background flex justify-center items-center h-10 w-10 border rounded overflow-hidden">
              {user?.avatarUrl && role === 'user'
                ? (
                  <img
                    className='block aspect-square w-10 h-10'
                    src={user.avatarUrl}
                    alt={user?.username}
                    title={`@${user?.username}`}
                  />
                  )
                : <User />}
            </div>
            <h3 className="font-semibold">
              {role === 'user' ? (user?.name ?? role) : role}
            </h3>
          </div>
          <div className="invisible group-hover:visible">
            <Button className="w-8 h-8" size='icon' variant='ghost'>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 mt-5 mb-12 space-y-2 overflow-hidden">
          <MemoizedReactMarkdown
            className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
            components={{
              p ({ children }) {
                return <p className="mb-2 last:mb-0">{children}</p>
              },
              code ({ node, inline, className, children, ...props }) {
                if (children.length) {
                  if (children[0] === '▍') {
                    return (
                      <span className="mt-1 cursor-default animate-pulse">▍</span>
                    )
                  }

                  children[0] = (children[0] as string).replace('`▍`', '▍')
                }

                const match = /language-(\w+)/.exec(className ?? '')

                if (inline) {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }

                return (
                  <CodeBlock
                    key={crypto.randomUUID()}
                    language={(match?.[1]) ?? ''}
                    value={String(children).replace(/\n$/, '')}
                    {...props}
                  />
                )
              }
            }}
            remarkPlugins={[remarkGfm, remarkMath]}
          >
            {content}
          </MemoizedReactMarkdown>
        </div>
      </div>
    </div>
  )
}

export default ChatMessages
