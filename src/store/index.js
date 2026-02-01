import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import usersReducer from './slices/usersSlice'
import institutionsReducer from './slices/institutionsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    institutions: institutionsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})

export default store
