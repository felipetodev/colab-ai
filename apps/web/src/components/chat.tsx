import { Settings } from "lucide-react"
import ChatInput from "./chat-input"
import ChatMessages from "./chat-messages"
import { Button } from "./ui/button"
// import ChatSettings from "./chat-settings"

function Chat() {
  return (
    <div className="relative flex flex-col justify-between bg-zinc-400 dark:bg-zinc-900 w-full h-full">
      {/* <ChatSettings /> */}

      {/* Chat Header */}
      <div className="relative min-h-full w-full overflow-y-auto">
        <div className="relative flex min-h-[calc(100vh-90px-60px)] w-full flex-col pb-8">
          <header className="sticky top-0 flex h-[50px] justify-center items-center border-b px-4 py-3 bg-background/70">
            <div className="flex items-center space-x-2">
              <h1>New Chat</h1>
              <Button className="w-8 h-8" size='icon' variant='ghost'>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <ChatMessages />
        </div>
        <ChatInput />
      </div>
    </div>
  )
}

export default Chat
