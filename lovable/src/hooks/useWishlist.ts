import { useState, useEffect, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'

interface WishlistItem {
  id: string
  name: string
  price: number
  image: string
  slug: string
  addedAt: string
}

interface WishlistState {
  items: WishlistItem[]
  loading: boolean
  itemsCount: number
}

export function useWishlist() {
  const [wishlistState, setWishlistState] = useState<WishlistState>({
    items: [],
    loading: true,
    itemsCount: 0
  })

  // Load wishlist from localStorage
  const loadWishlist = useCallback(() => {
    try {
      const savedWishlist = localStorage.getItem('user_wishlist')
      const items = savedWishlist ? JSON.parse(savedWishlist) : []
      
      setWishlistState({
        items,
        loading: false,
        itemsCount: items.length
      })
    } catch (error) {
      console.error('Error loading wishlist:', error)
      setWishlistState({
        items: [],
        loading: false,
        itemsCount: 0
      })
    }
  }, [])

  // Save wishlist to localStorage
  const saveWishlist = useCallback((items: WishlistItem[]) => {
    try {
      localStorage.setItem('user_wishlist', JSON.stringify(items))
    } catch (error) {
      console.error('Error saving wishlist:', error)
    }
  }, [])

  // Check if item is in wishlist
  const isInWishlist = useCallback((productId: string): boolean => {
    return wishlistState.items.some(item => item.id === productId)
  }, [wishlistState.items])

  // Add item to wishlist
  const addToWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    const existingItem = wishlistState.items.find(i => i.id === item.id)
    
    if (existingItem) {
      toast({
        title: '이미 찜한 상품입니다',
        description: '이 상품은 이미 찜 목록에 있습니다.',
        variant: 'default'
      })
      return
    }

    const newItem: WishlistItem = {
      ...item,
      addedAt: new Date().toISOString()
    }

    const updatedItems = [newItem, ...wishlistState.items]
    
    setWishlistState({
      items: updatedItems,
      loading: false,
      itemsCount: updatedItems.length
    })
    
    saveWishlist(updatedItems)
    
    toast({
      title: '찜 목록에 추가됨',
      description: '상품이 찜 목록에 추가되었습니다.'
    })
  }, [wishlistState.items, saveWishlist])

  // Remove item from wishlist
  const removeFromWishlist = useCallback((productId: string) => {
    const updatedItems = wishlistState.items.filter(item => item.id !== productId)
    
    setWishlistState({
      items: updatedItems,
      loading: false,
      itemsCount: updatedItems.length
    })
    
    saveWishlist(updatedItems)
    
    toast({
      title: '찜 목록에서 제거됨',
      description: '상품이 찜 목록에서 제거되었습니다.'
    })
  }, [wishlistState.items, saveWishlist])

  // Toggle wishlist status
  const toggleWishlist = useCallback((item: Omit<WishlistItem, 'addedAt'>) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id)
    } else {
      addToWishlist(item)
    }
  }, [isInWishlist, addToWishlist, removeFromWishlist])

  // Clear entire wishlist
  const clearWishlist = useCallback(() => {
    setWishlistState({
      items: [],
      loading: false,
      itemsCount: 0
    })
    
    saveWishlist([])
    
    toast({
      title: '찜 목록 삭제',
      description: '모든 찜 목록이 삭제되었습니다.'
    })
  }, [saveWishlist])

  // Get wishlist items sorted by most recently added
  const getWishlistItems = useCallback(() => {
    return [...wishlistState.items].sort((a, b) => 
      new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
    )
  }, [wishlistState.items])

  // Initialize wishlist on mount
  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  return {
    ...wishlistState,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    getWishlistItems
  }
}