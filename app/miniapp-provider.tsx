'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import sdk from '@farcaster/miniapp-sdk'

interface MiniappContextType {
  sdk: typeof sdk | null
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
  const [isReady, setIsReady] = useState(false)
  const [context, setContext] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initSdk = async () => {
      try {
        // Check if running in Farcaster frame context
        if (typeof window !== 'undefined' && window.parent !== window) {
          // Initialize the SDK
          await sdk.ready()
          
          // Get context
          const ctx = await sdk.getContext()
          const usr = await sdk.getUser()
          
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
  }, [])

  return (
    <MiniappContext.Provider value={{ sdk, isReady, context, user }}>
      {children}
    </MiniappContext.Provider>
  )
}