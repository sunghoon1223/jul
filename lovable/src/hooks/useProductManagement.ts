import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import { apiClient, Product, ProductFormData } from '@/lib/apiClient'

export function useProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  // Load products from PHP API
  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const productsData = await apiClient.getProducts()
      setProducts(productsData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: '제품 로드 실패',
        description: '제품 목록을 불러오는 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Create new product
  const createProduct = useCallback(async (formData: ProductFormData): Promise<boolean> => {
    try {
      setLoading(true)
      const newProduct = await apiClient.createProduct(formData)
      
      // 목록에 새 제품 추가
      setProducts(prev => [newProduct, ...prev])

      toast({
        title: '제품 생성 완료',
        description: '새 제품이 성공적으로 생성되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: '제품 생성 실패',
        description: error instanceof Error ? error.message : '제품 생성 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Update existing product
  const updateProduct = useCallback(async (id: string, formData: ProductFormData): Promise<boolean> => {
    try {
      setLoading(true)
      const updatedProduct = await apiClient.updateProduct(id, formData)
      
      // 목록에서 제품 업데이트
      setProducts(prev => prev.map(product =>
        product.id === id ? updatedProduct : product
      ))

      toast({
        title: '제품 수정 완료',
        description: '제품이 성공적으로 수정되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: '제품 수정 실패',
        description: error instanceof Error ? error.message : '제품 수정 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Delete product
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await apiClient.deleteProduct(id)
      
      // 목록에서 제품 제거
      setProducts(prev => prev.filter(product => product.id !== id))

      toast({
        title: '제품 삭제 완료',
        description: '제품이 성공적으로 삭제되었습니다.'
      })

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: '제품 삭제 실패',
        description: error instanceof Error ? error.message : '제품 삭제 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Toggle product publication status
  const togglePublishStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      const updatedProduct = await apiClient.toggleProductPublish(id)
      
      // 목록에서 제품 상태 업데이트
      setProducts(prev => prev.map(product =>
        product.id === id ? updatedProduct : product
      ))

      toast({
        title: `제품 ${updatedProduct.is_published ? '발행' : '발행 취소'} 완료`,
        description: `제품이 성공적으로 ${updatedProduct.is_published ? '발행' : '발행 취소'}되었습니다.`
      })

      return true
    } catch (error) {
      console.error('Error toggling publish status:', error)
      toast({
        title: '상태 변경 실패',
        description: error instanceof Error ? error.message : '제품 상태 변경 중 오류가 발생했습니다.',
        variant: 'destructive'
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  // Get product by ID
  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(product => product.id === id)
  }, [products])

  return {
    products,
    loading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    togglePublishStatus,
    getProductById
  }
}

export type { Product, ProductFormData }