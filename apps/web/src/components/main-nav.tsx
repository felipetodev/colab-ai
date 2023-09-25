import Link from "next/link"
import { HomeIcon, SettingsIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AuthButtonServer } from "./auth-button-server"

function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <div className="border-b">
      <div className="flex h-14 items-center px-4">
        <nav
          className={cn("flex items-center space-x-2 lg:space-x-2", className)}
          {...props}
        >
          <Link
            className="text-sm font-medium transition-colors hover:text-secondary mr-2"
            href="/"
          >
            Your workspace
          </Link>


          <Button className="w-8 h-8" size="icon">
            <HomeIcon className="h-5 w-5" />
          </Button>

          <Button className="w-8 h-8" size="icon" variant='ghost'>
            <SettingsIcon className="h-5 w-5" />
          </Button>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <AuthButtonServer />
        </div>
      </div>
    </div>
  )
}

export default MainNav
