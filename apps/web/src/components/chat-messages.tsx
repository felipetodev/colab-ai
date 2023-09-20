import { User, Copy } from "lucide-react"
import { Button } from "./ui/button"
 
function ChatMessages() {
  return (
    <div className="bg-secondary/50">
      {/* User */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-2">
            <div className="bg-background flex justify-center items-center h-10 w-10 border rounded overflow-hidden">
              <User />
            </div>
            <h3 className="font-semibold">felipetodev</h3>
          </div>
          <div>
            <Button className="w-8 h-8" size='icon' variant='ghost'>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="mt-5 mb-12">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus ipsum cumque nobis eligendi quis expedita ullam quam tempora illo nam eos blanditiis aperiam consectetur iure dolores, molestiae vel. Architecto, quasi.
        </div>
      </div>
    </div>
  )
}

export default ChatMessages
