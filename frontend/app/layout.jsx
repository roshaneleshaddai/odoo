import './globals.css'
import { AuthProvider } from '../context/AuthContext'


export const metadata = {
  title: 'StackIt - Q&A Forum Platform',
  description: 'A community-driven Q&A platform for developers and tech enthusiasts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}