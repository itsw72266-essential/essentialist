import Link from 'next/link'

// This must be a synchronous function (no 'async')
export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-4 text-center">
      <h1 className="text-4xl font-bold text-pink-600">404 - Page Not Found</h1>
      <p className="mt-4 text-gray-600">The beauty product or page you are looking for doesn't exist.</p>
      <Link 
        href="/" 
        className="mt-6 px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-all"
      >
        Return Home
      </Link>
    </main>
  )
}