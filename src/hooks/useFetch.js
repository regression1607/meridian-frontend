import { useState, useEffect, useCallback } from 'react'

export function useFetch(fetchFn, dependencies = [], options = {}) {
  const { immediate = true, onSuccess, onError } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error, setError] = useState(null)

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn(...args)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchFn, onSuccess, onError])

  const refetch = useCallback(() => {
    return execute()
  }, [execute])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, dependencies)

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    reset,
    setData
  }
}

export function useMutation(mutationFn, options = {}) {
  const { onSuccess, onError, onSettled } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true)
      setError(null)
      const result = await mutationFn(...args)
      setData(result)
      onSuccess?.(result, ...args)
      return result
    } catch (err) {
      const errorMessage = err.message || 'An error occurred'
      setError(errorMessage)
      onError?.(err, ...args)
      throw err
    } finally {
      setLoading(false)
      onSettled?.()
    }
  }, [mutationFn, onSuccess, onError, onSettled])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    reset,
    isLoading: loading,
    isError: !!error,
    isSuccess: !!data && !error
  }
}

export function usePagination(fetchFn, options = {}) {
  const { pageSize = 10, initialPage = 1 } = options
  
  const [page, setPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  
  const { data, loading, error, execute } = useFetch(
    () => fetchFn({ page, limit: pageSize }),
    [page, pageSize],
    {
      onSuccess: (result) => {
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages)
          setTotalItems(result.pagination.total)
        }
      }
    }
  )

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(p => p + 1)
    }
  }, [page, totalPages])

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(p => p - 1)
    }
  }, [page])

  const goToPage = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
  }, [totalPages])

  return {
    data: data?.data || [],
    loading,
    error,
    page,
    pageSize,
    totalPages,
    totalItems,
    nextPage,
    prevPage,
    goToPage,
    setPage,
    refetch: execute,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  }
}

export default useFetch
