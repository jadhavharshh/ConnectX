import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme-provider"
import './index.css'
import App from './App.tsx'
import { ClerkProvider } from '@clerk/clerk-react'
import { Toaster } from './components/ui/sonner.tsx'

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}


createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} >
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Toaster />
      <App />
    </ThemeProvider>
  </ClerkProvider>

)
