import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { institutionsApi } from '../../services/api'

// Async thunks
export const fetchInstitutions = createAsyncThunk(
  'institutions/fetchInstitutions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await institutionsApi.getAll(params)
      return response
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch institutions')
    }
  }
)

export const fetchInstitutionById = createAsyncThunk(
  'institutions/fetchInstitutionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await institutionsApi.getById(id)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch institution')
    }
  }
)

export const createInstitution = createAsyncThunk(
  'institutions/createInstitution',
  async (data, { rejectWithValue }) => {
    try {
      const response = await institutionsApi.create(data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create institution')
    }
  }
)

export const updateInstitution = createAsyncThunk(
  'institutions/updateInstitution',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await institutionsApi.update(id, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update institution')
    }
  }
)

export const deleteInstitution = createAsyncThunk(
  'institutions/deleteInstitution',
  async (id, { rejectWithValue }) => {
    try {
      await institutionsApi.delete(id)
      return id
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete institution')
    }
  }
)

// Initial state
const initialState = {
  institutions: [],
  currentInstitution: null,
  stats: {
    total: 0,
    active: 0,
    premium: 0,
    free: 0
  },
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1
  },
  filters: {
    search: '',
    type: 'all',
    plan: 'all',
    status: 'all'
  },
  loading: false,
  error: null,
  selectedInstitutions: []
}

// Slice
const institutionsSlice = createSlice({
  name: 'institutions',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.pagination.page = 1
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload
    },
    setSelectedInstitutions: (state, action) => {
      state.selectedInstitutions = action.payload
    },
    toggleSelectInstitution: (state, action) => {
      const id = action.payload
      if (state.selectedInstitutions.includes(id)) {
        state.selectedInstitutions = state.selectedInstitutions.filter(i => i !== id)
      } else {
        state.selectedInstitutions.push(id)
      }
    },
    toggleSelectAll: (state) => {
      if (state.selectedInstitutions.length === state.institutions.length) {
        state.selectedInstitutions = []
      } else {
        state.selectedInstitutions = state.institutions.map(i => i._id)
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentInstitution: (state) => {
      state.currentInstitution = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch institutions
      .addCase(fetchInstitutions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchInstitutions.fulfilled, (state, action) => {
        state.loading = false
        state.institutions = action.payload.data || []
        if (action.payload.meta) {
          state.pagination = { ...state.pagination, ...action.payload.meta }
        }
        // Calculate stats
        const all = action.payload.data || []
        state.stats = {
          total: action.payload.meta?.total || all.length,
          active: all.filter(i => i.isActive).length,
          premium: all.filter(i => ['premium', 'enterprise'].includes(i.subscription?.plan)).length,
          free: all.filter(i => i.subscription?.plan === 'free' || !i.subscription?.plan).length
        }
      })
      .addCase(fetchInstitutions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch by ID
      .addCase(fetchInstitutionById.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchInstitutionById.fulfilled, (state, action) => {
        state.loading = false
        state.currentInstitution = action.payload
      })
      .addCase(fetchInstitutionById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create
      .addCase(createInstitution.pending, (state) => {
        state.loading = true
      })
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.loading = false
        state.institutions.unshift(action.payload)
        state.stats.total += 1
      })
      .addCase(createInstitution.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update
      .addCase(updateInstitution.pending, (state) => {
        state.loading = true
      })
      .addCase(updateInstitution.fulfilled, (state, action) => {
        state.loading = false
        const index = state.institutions.findIndex(i => i._id === action.payload._id)
        if (index !== -1) {
          state.institutions[index] = action.payload
        }
        state.currentInstitution = action.payload
      })
      .addCase(updateInstitution.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Delete
      .addCase(deleteInstitution.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteInstitution.fulfilled, (state, action) => {
        state.loading = false
        state.institutions = state.institutions.filter(i => i._id !== action.payload)
        state.stats.total -= 1
        state.selectedInstitutions = state.selectedInstitutions.filter(id => id !== action.payload)
      })
      .addCase(deleteInstitution.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const {
  setFilters,
  setPage,
  setSelectedInstitutions,
  toggleSelectInstitution,
  toggleSelectAll,
  clearError,
  clearCurrentInstitution
} = institutionsSlice.actions

export default institutionsSlice.reducer
