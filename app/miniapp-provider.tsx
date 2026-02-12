'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { MiniAppSDK } from '@farcaster/miniapp-sdk'

interface MiniappContextType {
  sdk: MiniAppSDK | null
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
  const [sdk, setSdk] = useState<MiniAppSDK | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [context, setContext] = useState<any>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const initSdk = async () => {
      try {
        // Check if running in Farcaster frame context
        if (typeof window !== 'undefined' && window.parent !== window) {
          const miniappSdk = new MiniAppSDK()
          
          // Initialize the SDK
          await miniappSdk.ready()
          
          // Get context
          const ctx = await miniappSdk.getContext()
          const usr = await miniappSdk.getUser()
          
          setSdk(miniappSdk)
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