import Navigation from '@/components/Navigation'
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from '@/lib/AuthContext'
import { Providers } from './providers'

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <Providers>
            <Navigation />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  )
}
