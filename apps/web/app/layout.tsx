import ReactQueryProvider from '@/lib/ReactQueryProvider'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DevNotes',
  description: 'Marketplace for free and premium software engineering notes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ReactQueryProvider>
          {children}
          <Toaster
            position='top-center'
            gutter={12}
            containerStyle={{ margin: '8px' }}
            toastOptions={{
              success: { duration: 3000 },
              error: {
                duration: 5000,
              },
              style: {
                fontSize: '16px',
                maxWidth: '500px',
                padding: '16px 24px',
              },
            }}
          />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
