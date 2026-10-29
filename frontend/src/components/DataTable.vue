<script setup>
import { computed, ref, watch } from 'vue'

// F3: Reusable table using the composition API.
// Props let the client, event, and service pages share this component.
const props = defineProps({
  columns: {
    type: Array,
    required: true
  },
  rows: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['row-click'])
// Track the selected sort and current page using reactive refs.
const sortKey = ref(null)
const sortDirection = ref(null)
const currentPage = ref(1)
const pageSize = 10
// Cycle through ascending, descending, and original order.
// Reset to page 1 when the sort changes.
function sortBy(key) {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDirection.value = 'asc'
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc'
  } else {
    sortKey.value = null
    sortDirection.value = null
  }

  currentPage.value = 1
}
// Sort a copy of the rows without changing the parent's data.
// Sorting happens before pagination so it includes all matching records.
const sortedRows = computed(() => {
  const result = [...props.rows]

  if (!sortKey.value) return result

  return result.sort((a, b) => {
    const first = a[sortKey.value]
    const second = b[sortKey.value]

    let comparison

    if (typeof first === 'number' && typeof second === 'number') {
      comparison = first - second
    } else {
      comparison = String(first ?? '').localeCompare(
        String(second ?? ''),
        undefined,
        { numeric: true, sensitivity: 'base' }
      )
    }

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(props.rows.length / pageSize))
)
// Calculate which 10 rows to display on the current page.
const visibleRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedRows.value.slice(start, start + pageSize)
})

const firstRow = computed(() =>
  props.rows.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1
)

const lastRow = computed(() =>
  Math.min(currentPage.value * pageSize, props.rows.length)
)

// Start on page 1 whenever a search or reload changes the rows.
watch(
  () => props.rows,
  () => {
    currentPage.value = 1
  },
  { deep: true }
)

function displayValue(row, column) {
  const value = row[column.key]
  return column.render ? column.render(value, row) : (value ?? '')
}

function ariaSort(key) {
  if (sortKey.value !== key) return 'none'
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}
</script>

<template>
  <div>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead class="bg-gray-100">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :aria-sort="ariaSort(column.key)"
              class="border-b p-3"
            >
              <button
                type="button"
                class="w-full text-left font-bold"
                @click="sortBy(column.key)"
              >
                {{ column.label }}
                <span v-if="sortKey === column.key" aria-hidden="true">
                  {{ sortDirection === 'asc' ? '▲' : '▼' }}
                </span>
              </button>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="rows.length === 0">
            <td
              :colspan="columns.length"
              class="p-4 text-center text-gray-500"
            >
              No results
            </td>
          </tr>

          <tr
            v-for="(row, index) in visibleRows"
            :key="row._id ?? row.id ?? index"
            tabindex="0"
            class="cursor-pointer border-b hover:bg-gray-100 focus:bg-gray-100"
            @click="emit('row-click', row)"
            @keydown.enter.prevent="emit('row-click', row)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="p-3"
            >
              {{ displayValue(row, column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p>Showing {{ firstRow }}–{{ lastRow }} of {{ rows.length }}</p>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>

        <span>Page {{ currentPage }} of {{ totalPages }}</span>

        <button
          type="button"
          class="rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="currentPage >= totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>