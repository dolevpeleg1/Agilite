import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'agilite-user-mode'

export type UserMode = 'customer' | 'admin' | null

function loadStoredMode(): UserMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'customer' || stored === 'admin') return stored
  } catch {
    /* ignore */
  }
  return null
}

function saveMode(mode: UserMode) {
  try {
    if (mode) {
      localStorage.setItem(STORAGE_KEY, mode)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
}

type UserModeContextValue = {
  userMode: UserMode
  selectCustomerMode: () => void
  selectAdminMode: () => void
  clearMode: () => void
}

const UserModeContext = createContext<UserModeContextValue | null>(null)

export function UserModeProvider({ children }: { children: ReactNode }) {
  const [userMode, setUserMode] = useState<UserMode>(loadStoredMode)

  const selectCustomerMode = useCallback(() => {
    setUserMode('customer')
    saveMode('customer')
  }, [])

  const selectAdminMode = useCallback(() => {
    setUserMode('admin')
    saveMode('admin')
  }, [])

  const clearMode = useCallback(() => {
    setUserMode(null)
    saveMode(null)
  }, [])

  const value = useMemo(
    () => ({
      userMode,
      selectCustomerMode,
      selectAdminMode,
      clearMode,
    }),
    [userMode, selectCustomerMode, selectAdminMode, clearMode]
  )

  return (
    <UserModeContext.Provider value={value}>{children}</UserModeContext.Provider>
  )
}

export function useUserMode() {
  const ctx = useContext(UserModeContext)
  if (!ctx) throw new Error('useUserMode must be used within UserModeProvider')
  return ctx
}
