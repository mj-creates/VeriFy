import './globals.css'

export const metadata = {
  title: 'VeriFY',
  description: 'AI Fact-Checking Agent',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  )
}
