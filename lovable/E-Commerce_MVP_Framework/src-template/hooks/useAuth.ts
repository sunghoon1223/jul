import { useState, useEffect, useCallback } from 'react'
import { apiClient, User } from '@/lib/apiClient'
import { toast } from 'sonner'

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  })

  useEffect(() => {
    // 저장된 사용자 정보 확인
    const checkAuth = async () => {
      try {
        if (apiClient.isAuthenticated()) {
          const user = await apiClient.getCurrentUser()
          setAuthState({
            user,
            loading: false
          })
        } else {
          setAuthState({
            user: null,
            loading: false
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setAuthState({
          user: null,
          loading: false
        })
      }
    }

    checkAuth()
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName?: string, phone?: string) => {
    try {
      const result = await apiClient.signUp(email, password, fullName || '', phone)
      setAuthState({
        user: result.user,
        loading: false
      })
      toast.success('회원가입이 완료되었습니다!')
      return { error: null, data: result }
    } catch (error: any) {
      const errorMessage = error.message || '회원가입에 실패했습니다.'
      toast.error(errorMessage)
      return { error: { message: errorMessage }, data: null }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const result = await apiClient.signIn(email, password)
      setAuthState({
        user: result.user,
        loading: false
      })
      toast.success('로그인되었습니다!')
      return { error: null, data: result }
    } catch (error: any) {
      const errorMessage = error.message || '로그인에 실패했습니다.'
      toast.error(errorMessage)
      return { error: { message: errorMessage }, data: null }
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await apiClient.signOut()
      setAuthState({
        user: null,
        loading: false
      })
      toast.success('로그아웃되었습니다!')
      return { error: null }
    } catch (error: any) {
      const errorMessage = error.message || '로그아웃에 실패했습니다.'
      toast.error(errorMessage)
      return { error: { message: errorMessage } }
    }
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    // TODO: PHP API에 비밀번호 재설정 기능 구현 필요
    toast.error('비밀번호 재설정 기능은 곧 제공될 예정입니다.')
    return { error: { message: '비밀번호 재설정 기능은 곧 제공될 예정입니다.' } }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    // TODO: OAuth 기능은 고객 설정 후 구현
    toast.error('구글 로그인은 곧 제공될 예정입니다.')
    return { error: { message: '구글 로그인은 곧 제공될 예정입니다.' } }
  }, [])

  const signInWithKakao = useCallback(async () => {
    // TODO: OAuth 기능은 고객 설정 후 구현
    toast.error('카카오 로그인은 곧 제공될 예정입니다.')
    return { error: { message: '카카오 로그인은 곧 제공될 예정입니다.' } }
  }, [])

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithKakao
  }
}