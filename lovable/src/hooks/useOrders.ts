import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orderService, Order, CreateOrderRequest } from '@/services/orderService'
import { useAuth } from './useAuth'

export function useOrders() {
  const { user } = useAuth()
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderService.getOrders(user?.id),
    enabled: !!user
  })
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderService.getOrder(orderId),
    enabled: !!orderId
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => orderService.createOrder(orderData),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] })
    }
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: Order['status'] }) => 
      orderService.updateOrderStatus(orderId, status),
    onSuccess: (_, { orderId }) => {
      // Invalidate specific order and orders list
      queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      // Invalidate orders query to refetch
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] })
    }
  })
}