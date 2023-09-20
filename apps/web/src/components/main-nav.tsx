import Link from "next/link"
import { HomeIcon, GearIcon } from "@radix-ui/react-icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
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
        <GearIcon className="h-5 w-5" />
      </Button>
    </nav>
  )
}

export default MainNav
