
import { ref } from 'vue'

// composable function to handle API calls with loading and error states to avoid repeating the same logic in multiple components
export function useApi(apiCall) {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function execute(request = apiCall) {
    loading.value = true
    error.value = null

    try {
      data.value = await request()
      return data.value
    } catch (err) {
      error.value = err?.message || 'The request failed. Please try again.'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute,
  }
}
