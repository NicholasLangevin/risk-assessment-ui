import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 text-center">
      <AlertTriangle className="h-16 w-16 text-destructive mb-6" />
      <h1 className="text-4xl font-bold mb-4 font-headline">Page Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Sorry, we couldn&apos;t find the page you&apos;re looking for.
      </p>
      <Button asChild size="lg">
        <Link href="/">Return to Dashboard</Link>
      </Button>
    </div>
  )
}
