import { Spinner } from '@/components/ui/icons'

export default function LoadingPage () {
  return (
    <div className="flex flex-1 justify-center items-center h-full">
      <Spinner className='animate-spin w-10 h-10' />
    </div>
  )
}
