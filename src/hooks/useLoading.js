import { useState, useCallback } from 'react'

export function useLoading(initialState = false) {
  const [loading, setLoading] = useState(initialState)
  const [error, setError] = useState(null)

  const startLoading = useCallback(() => {
    setLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const setLoadingError = useCallback((err) => {
    setError(err)
    setLoading(false)
  }, [])

  const withLoading = useCallback(async (asyncFn) => {
    try {
      startLoading()
      const result = await asyncFn()
      stopLoading()
      return result
    } catch (err) {
      setLoadingError(err.message || 'An error occurred')
      throw err
    }
  }, [startLoading, stopLoading, setLoadingError])

  return {
    loading,
    error,
    setLoading,
    setError,
    startLoading,
    stopLoading,
    setLoadingError,
    withLoading
  }
}

export function useMultiLoading(keys = []) {
  const [loadingStates, setLoadingStates] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: false }), {})
  )
  const [errors, setErrors] = useState(
    keys.reduce((acc, key) => ({ ...acc, [key]: null }), {})
  )

  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }))
    if (value) {
      setErrors(prev => ({ ...prev, [key]: null }))
    }
  }, [])

  const setError = useCallback((key, error) => {
    setErrors(prev => ({ ...prev, [key]: error }))
    setLoadingStates(prev => ({ ...prev, [key]: false }))
  }, [])

  const isLoading = useCallback((key) => {
    return key ? loadingStates[key] : Object.values(loadingStates).some(Boolean)
  }, [loadingStates])

  const getError = useCallback((key) => {
    return errors[key]
  }, [errors])

  const withLoading = useCallback(async (key, asyncFn) => {
    try {
      setLoading(key, true)
      const result = await asyncFn()
      setLoading(key, false)
      return result
    } catch (err) {
      setError(key, err.message || 'An error occurred')
      throw err
    }
  }, [setLoading, setError])

  return {
    loadingStates,
    errors,
    setLoading,
    setError,
    isLoading,
    getError,
    withLoading
  }
}

export default useLoading
