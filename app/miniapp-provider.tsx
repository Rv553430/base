'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface MiniappContextType {
  sdk: any | null
  isReady: boolean
  context: any
  user: any
}

const MiniappContext = createContext<MiniappContextType>({
  sdk: null,
  isReady: false,
  context: null,
  user: null,
})

export function useMiniapp() {
  return useContext(MiniappContext)
}

interface MiniappProviderProps {
  children: ReactNode
}

export function MiniappProvider({ children }: MiniappProviderProps) {
  const [sdk, setSdk] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [context, setContext] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    const initSdk = async () => {
      try {
        // Dynamically import SDK only on client
        const miniappSdk = await import('@farcaster/miniapp-sdk')
        const sdkInstance = miniappSdk.default
        
        // Check if running in Farcaster frame context
        if (typeof window !== 'undefined' && window.parent !== window) {
          // Call sdk.actions.ready() to dismiss splash screen
          await sdkInstance.actions.ready()
          
          // Get context
          const ctx = await sdkInstance.getContext()
          const usr = await sdkInstance.getUser()
          
          setSdk(sdkInstance)
          setContext(ctx)
          setUser(usr)
          setIsReady(true)
          
          console.log('Farcaster Miniapp SDK initialized:', { context: ctx, user: usr })
        }
      } catch (error) {
        console.log('Not running in Farcaster frame or SDK error:', error)
        // App works fine outside Farcaster too
      }
    }

    initSdk()
  }, [mounted])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <MiniappContext.Provider value={{ sdk, isReady, context, user }}>
      {children}
    </MiniappContext.Provider>
  )
}