import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "InnovateK Hub · UnionX",
  description: "Hub de gestión de marcas propias, skills y automatizaciones de UnionX",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          <div className="p-8">{children}</div>
        </main>
      </body>
    </html>
  )
}
