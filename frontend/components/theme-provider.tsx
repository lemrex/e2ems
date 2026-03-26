// "use client"

// import { createContext, useContext, useEffect, useState } from "react"

// type Theme = "dark" | "light"

// type ThemeProviderProps = {
//   children: React.ReactNode
//   defaultTheme?: Theme
//   storageKey?: string
// }

// type ThemeProviderState = {
//   theme: Theme
//   setTheme: (theme: Theme) => void
// }

// const initialState: ThemeProviderState = {
//   theme: "light",
//   setTheme: () => null,
// }

// const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

// export function ThemeProvider({
//   children,
//   defaultTheme = "light",
//   storageKey = "ui-theme",
//   ...props
// }: ThemeProviderProps) {
//   const [theme, setTheme] = useState<Theme>(defaultTheme)
//   const [mounted, setMounted] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//     // Get theme from localStorage on mount
//     const stored = localStorage.getItem(storageKey) as Theme | null
//     if (stored === "dark" || stored === "light") {
//       setTheme(stored)
//     }
//   }, [storageKey])

//   useEffect(() => {
//     if (!mounted) return

//     const root = window.document.documentElement
    
//     // Remove both classes first
//     root.classList.remove("light", "dark")
    
//     // Add the current theme class
//     root.classList.add(theme)
    
//     // Save to localStorage
//     localStorage.setItem(storageKey, theme)
//   }, [theme, storageKey, mounted])

//   const value = {
//     theme,
//     setTheme: (newTheme: Theme) => {
//       setTheme(newTheme)
//     },
//   }

//   // Prevent flash of incorrect theme
//   if (!mounted) {
//     return <>{children}</>
//   }

//   return (
//     <ThemeProviderContext.Provider {...props} value={value}>
//       {children}
//     </ThemeProviderContext.Provider>
//   )
// }

// export const useTheme = () => {
//   const context = useContext(ThemeProviderContext)

//   if (context === undefined)
//     throw new Error("useTheme must be used within a ThemeProvider")

//   return context
// }


"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored === "dark" || stored === "light") {
      setTheme(stored)
    }
  }, [storageKey])

  useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey, mounted])

  const value = { theme, setTheme }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within a ThemeProvider")
  return context
}
