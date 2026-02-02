import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { usersApi } from '../../services/api'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await usersApi.getAll(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users')
    }
  }
)

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await usersApi.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch user')
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersApi.create(userData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await usersApi.update(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await usersApi.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete user')
    }
  }
)

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  stats: {
    total: 0,
    students: 0,
    teachers: 0,
    parents: 0,
    staff: 0
  },
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1
  },
  filters: {
    search: '',
    role: 'all',
    status: 'all'
  },
  loading: false,
  error: null,
  selectedUsers: []
}

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload
    },
    toggleSelectUser: (state, action) => {
      const id = action.payload
      if (state.selectedUsers.includes(id)) {
        state.selectedUsers = state.selectedUsers.filter(u => u !== id)
      } else {
        state.selectedUsers.push(id)
      }
    },
    toggleSelectAll: (state) => {
      if (state.selectedUsers.length === state.users.length) {
        state.selectedUsers = []
      } else {
        state.selectedUsers = state.users.map(u => u._id)
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.data || []
        if (action.payload.meta) {
          state.pagination = { ...state.pagination, ...action.payload.meta }
        }
        // Use stats from API response (actual database counts)
        if (action.payload.stats) {
          state.stats = action.payload.stats
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false
        state.users.unshift(action.payload)
        state.stats.total += 1
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false
        const index = state.users.findIndex(u => u._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        state.currentUser = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false
        state.users = state.users.filter(u => u._id !== action.payload)
        state.stats.total -= 1
        state.selectedUsers = state.selectedUsers.filter(id => id !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setFilters,
  setPage,
  setSelectedUsers,
  toggleSelectUser,
  toggleSelectAll,
  clearError,
  clearCurrentUser
} = usersSlice.actions

export default usersSlice.reducer
