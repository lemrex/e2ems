// // import type React from "react"
// // import type { Metadata } from "next"
// // import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
// // import { Analytics } from "@vercel/analytics/next"
// // import { Toaster } from "@/components/ui/toaster"
// // import "./globals.css"

// // const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" })
// // const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

// // export const metadata: Metadata = {
// //   title: "ZenSpend - Futuristic Expense Tracker",
// //   description: "Track your expenses with style. Gen-Z approved.",
// //   generator: "v0.app",
// //   icons: {
// //     icon: [
// //       {
// //         url: "/icon-light-32x32.png",
// //         media: "(prefers-color-scheme: light)",
// //       },
// //       {
// //         url: "/icon-dark-32x32.png",
// //         media: "(prefers-color-scheme: dark)",
// //       },
// //       {
// //         url: "/icon.svg",
// //         type: "image/svg+xml",
// //       },
// //     ],
// //     apple: "/apple-icon.png",
// //   },
// // }

// // export default function RootLayout({
// //   children,
// // }: Readonly<{
// //   children: React.ReactNode
// // }>) {
// //   return (
// //     <html lang="en" className="dark">
// //       <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
// //         {children}
// //         <Toaster />
// //         <Analytics />
// //       </body>
// //     </html>
// //   )
// // }


// import type React from "react"
// import type { Metadata } from "next"
// import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
// import { Analytics } from "@vercel/analytics/next"
// import { Toaster } from "@/components/ui/toaster"
// import { ThemeProvider } from "@/components/theme-provider"
// import "./globals.css"

// const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" })
// const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

// export const metadata: Metadata = {
//   title: "ZenSpend - Futuristic Expense Tracker",
//   description: "Track your expenses with style. Gen-Z approved.",
//   generator: "v0.app",
//   icons: {
//     icon: [
//       {
//         url: "/icon-light-32x32.png",
//         media: "(prefers-color-scheme: light)",
//       },
//       {
//         url: "/icon-dark-32x32.png",
//         media: "(prefers-color-scheme: dark)",
//       },
//       {
//         url: "/icon.svg",
//         type: "image/svg+xml",
//       },
//     ],
//     apple: "/apple-icon.png",
//   },
// }

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
//         <ThemeProvider defaultTheme="dark" storageKey="zenspend-theme">
//           {children}
//           <Toaster />
//           <Analytics />
//         </ThemeProvider>
//       </body>
//     </html>
//   )
// }



import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-sans" })
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "ZenSpend - Futuristic Expense Tracker",
  description: "Track your expenses with style. Gen-Z approved.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider defaultTheme="dark" storageKey="zenspend-theme">
          {children}
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
