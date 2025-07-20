import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'super_admin'
  lastLogin?: string
}

interface AdminAuthState {
  isAdmin: boolean
  adminUser: AdminUser | null
  loading: boolean
  error: string | null
}

// Mock admin credentials for development
const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@jpcaster.com',
  password: 'admin123!',
  userData: {
    id: 'admin_001',
    email: 'admin@jpcaster.com',
    name: '관리자',
    role: 'admin' as const
  }
}

export function useAdmin() {
  const { user } = useAuth()
  const [adminState, setAdminState] = useState<AdminAuthState>(() => {
    // Initialize state by checking localStorage immediately
    try {
      const savedAdminData = localStorage.getItem('admin_session')
      const sessionExpiry = localStorage.getItem('admin_session_expiry')
      
      if (savedAdminData && sessionExpiry) {
        const adminData = JSON.parse(savedAdminData)
        const expiryTime = parseInt(sessionExpiry)
        const currentTime = new Date().getTime()
        
        if (currentTime < expiryTime) {
          console.log('🟢 Initial admin session found and valid')
          return {
            isAdmin: true,
            adminUser: adminData,
            loading: false,
            error: null
          }
        } else {
          console.log('🟡 Initial admin session expired, clearing')
          localStorage.removeItem('admin_session')
          localStorage.removeItem('admin_session_expiry')
        }
      }
      
      console.log('🔴 No valid admin session found initially')
      return {
        isAdmin: false,
        adminUser: null,
        loading: false,
        error: null
      }
    } catch (error) {
      console.error('❌ Error checking initial admin status:', error)
      return {
        isAdmin: false,
        adminUser: null,
        loading: false,
        error: null
      }
    }
  })

  // Simple effect that only runs once to finalize state
  useEffect(() => {
    console.log('🔄 useAdmin effect running, current state:', adminState)
  }, [])

  const loginAsAdmin = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Admin login attempt:', email)
    setAdminState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check mock credentials
      if (email === MOCK_ADMIN_CREDENTIALS.email && password === MOCK_ADMIN_CREDENTIALS.password) {
        const adminUser = {
          ...MOCK_ADMIN_CREDENTIALS.userData,
          lastLogin: new Date().toISOString()
        }

        // Set session (expires in 8 hours)
        const expiryTime = new Date().getTime() + (8 * 60 * 60 * 1000)
        localStorage.setItem('admin_session', JSON.stringify(adminUser))
        localStorage.setItem('admin_session_expiry', expiryTime.toString())

        console.log('✅ Admin login successful, updating state immediately', adminUser)

        // Immediately update state - no delays, no async complications
        setAdminState({
          isAdmin: true,
          adminUser,
          loading: false,
          error: null
        })

        return true
      } else {
        console.log('❌ Invalid admin credentials')
        setAdminState(prev => ({
          ...prev,
          loading: false,
          error: '잘못된 관리자 계정 정보입니다.'
        }))
        return false
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setAdminState(prev => ({
        ...prev,
        loading: false,
        error: '로그인 중 오류가 발생했습니다.'
      }))
      return false
    }
  }

  const logoutAdmin = () => {
    console.log('🚪 Admin logout')
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_session_expiry')
    
    setAdminState({
      isAdmin: false,
      adminUser: null,
      loading: false,
      error: null
    })
  }

  const clearError = () => {
    setAdminState(prev => ({ ...prev, error: null }))
  }

  // Check if session is about to expire (within 30 minutes)
  const isSessionExpiringSoon = (): boolean => {
    const expiryTime = localStorage.getItem('admin_session_expiry')
    if (!expiryTime) return false
    
    const timeUntilExpiry = parseInt(expiryTime) - new Date().getTime()
    return timeUntilExpiry < (30 * 60 * 1000) // 30 minutes in milliseconds
  }

  const extendSession = () => {
    if (adminState.isAdmin && adminState.adminUser) {
      const newExpiryTime = new Date().getTime() + (8 * 60 * 60 * 1000)
      localStorage.setItem('admin_session_expiry', newExpiryTime.toString())
      console.log('⏰ Admin session extended')
    }
  }

  return {
    ...adminState,
    loginAsAdmin,
    logoutAdmin,
    clearError,
    isSessionExpiringSoon,
    extendSession
  }
}