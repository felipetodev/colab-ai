import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger
} from './ui/alert-dialog'
import { IconGitHub, IconGoogleAuth, Spinner } from './ui/icons'
import { Mail } from 'lucide-react'

type Props = {
  session: any
  handleSignIn: (provider: 'google' | 'github') => void
}

function LoginDialog ({ session, handleSignIn }: Props) {
  const [isLoading, setIsLoading] = useState({ google: false, github: false })
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (session == null) {
      setIsOpen(true)
    }
  }, [session])

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button size='sm'>
          Sign in
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Sign In with
            </h1>
          </div>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading.google}
            onClick={() => {
              handleSignIn('google')
              setIsLoading(prev => ({ ...prev, google: true }))
            }}
          >
            {isLoading.google
              ? (
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                )
              : (
                <IconGoogleAuth className="mr-2 h-6 w-6" />
                )}{' '}
            Google
          </Button>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading.github}
            onClick={() => {
              setIsLoading(prev => ({ ...prev, github: true }))
              handleSignIn('github')
            }}
          >
            {isLoading.github
              ? (
                <Spinner className="mr-2 h-4 w-4 animate-spin" />
                )
              : (
                <IconGitHub className="mr-2 h-5 w-5" />
                )}{' '}
            GitHub
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
          <Button className='cursor-not-allowed' variant="outline" type="button" disabled>
            <Mail className="mr-2 h-5 w-5" />{' '}
            Email (soon)
          </Button>
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{' '}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default LoginDialog
