import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { apiClient, Notice, NoticeFormData } from '@/lib/apiClient'

export function useNoticeManagement() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load notices from PHP API
  const loadNotices = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await apiClient.getNotices()
      setNotices(response.notices)
    } catch (error) {
      console.error('Error loading notices:', error)
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.')
      toast({
        title: '공지사항 로드 실패',
        description: '공지사항을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new notice
  const createNotice = useCallback(async (formData: NoticeFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const newNotice = await apiClient.createNotice({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        is_pinned: formData.isPinned || false
      })

      // Add to local state
      setNotices(prev => [newNotice, ...prev])

      toast({
        title: '공지사항 생성 완료',
        description: '새로운 공지사항이 성공적으로 생성되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error creating notice:', error)
      setError('공지사항 생성 중 오류가 발생했습니다.')
      
      toast({
        title: '생성 실패',
        description: error instanceof Error ? error.message : '공지사항 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update notice
  const updateNotice = useCallback(async (id: number, formData: NoticeFormData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const updatedNotice = await apiClient.updateNotice(id, {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        is_pinned: formData.isPinned || false
      })

      setNotices(prev => prev.map(notice => 
        notice.id === id ? updatedNotice : notice
      ))

      toast({
        title: '공지사항 수정 완료',
        description: '공지사항이 성공적으로 수정되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error updating notice:', error)
      setError('공지사항 수정 중 오류가 발생했습니다.')
      
      toast({
        title: '수정 실패',
        description: error instanceof Error ? error.message : '공지사항 수정 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete notice
  const deleteNotice = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      await apiClient.deleteNotice(id)
      setNotices(prev => prev.filter(notice => notice.id !== id))

      toast({
        title: '공지사항 삭제 완료',
        description: '공지사항이 성공적으로 삭제되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error deleting notice:', error)
      setError('공지사항 삭제 중 오류가 발생했습니다.')
      
      toast({
        title: '삭제 실패',
        description: error instanceof Error ? error.message : '공지사항 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle pin status
  const togglePin = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const updatedNotice = await apiClient.toggleNoticePin(id)
      
      setNotices(prev => prev.map(notice => 
        notice.id === id ? updatedNotice : notice
      ))

      toast({
        title: `공지사항 ${updatedNotice.is_pinned ? '고정' : '고정 해제'} 완료`,
        description: `공지사항이 성공적으로 ${updatedNotice.is_pinned ? '고정' : '고정 해제'}되었습니다.`
      })

      return true
    } catch (error) {
      console.error('Error toggling pin:', error)
      setError('고정 상태 변경 중 오류가 발생했습니다.')
      
      toast({
        title: '상태 변경 실패',
        description: error instanceof Error ? error.message : '고정 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    notices,
    loading,
    error,
    loadNotices,
    createNotice,
    updateNotice,
    deleteNotice,
    togglePin,
    clearError
  }
}

// 인터페이스를 별도로 export하여 이전 코드와의 호환성 유지
export interface Notice {
  id: number
  title: string
  content: string
  author: string
  createdAt: string
  created_at: string
  views: number
  isPinned: boolean
  is_pinned: boolean
  category: string
  thumbnail?: string
}

export interface NoticeFormData {
  title: string
  content: string
  category: string
  isPinned?: boolean
  thumbnail?: string
}