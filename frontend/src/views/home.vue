<!-- This is the home view - which shows a dashboard -->

<template>
  <main>
    <h1 class="mt-10 text-center text-4xl font-bold tracking-widest text-red-700">
      Dashboard
    </h1>

    <!-- Events Attendance -->
    <section class="mx-auto mt-10 w-full max-w-5xl px-6">
      <h2 class="mt-10 text-center text-3xl font-bold text-red-700">
        Events Attendance
      </h2>

      <p v-if="loading" class="mt-6 text-center" role="status">
        Loading attendance...
      </p>

      <div v-else-if="error" class="mt-6 rounded bg-red-50 p-4" role="alert">
        <h3 class="text-xl font-bold text-red-800">{{ error.title }}</h3>
        <p class="mt-2 text-red-900">{{ error.message }}</p>
        <button
          type="button"
          class="mt-3 rounded border border-red-700 px-3 py-1 text-red-700"
          @click="loadAttendance()"
        >
          Retry
        </button>
      </div>

      <p
        v-else-if="recentEvents.length === 0"
        class="mt-6 text-center"
      >
        No events found.
      </p>

      <template v-else>
        <table class="mt-6 min-w-full rounded shadow-md">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Event Name</th>
              <th class="p-4 text-left">Event Date</th>
              <th class="p-4 text-left">Number of Attendees</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr
              v-for="event in recentEvents"
              :key="event._id"
              @click="$router.push({ name: 'eventdetails', params: { id: event._id } })"
              class="cursor-pointer"
            >
              <td class="p-2 text-left">{{ event.name }}</td>
              <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
              <td class="p-2 text-left">{{ event.attendees.length }}</td>
            </tr>
          </tbody>
        </table>

        <AttendanceChart
          class="mt-8"
          :label="labels"
          :chart-data="chartData"
        />
      </template>
    </section>

    <!-- Clients by ZIP Code -->
    <section class="mx-auto mt-12 w-full max-w-5xl px-6">
      <h2 class="mt-10 text-center text-3xl font-bold text-red-700">
        Clients by Zip Code
      </h2>

      <p v-if="zipLoading" class="mt-6 text-center" role="status">
        Loading clients by ZIP code...
      </p>

      <div
        v-else-if="zipError"
        class="mt-6 rounded bg-red-50 p-4"
        role="alert"
      >
        <h3 class="text-xl font-bold text-red-800">{{ zipError.title }}</h3>
        <p class="mt-2 text-red-900">{{ zipError.message }}</p>
        <button
          type="button"
          class="mt-3 rounded border border-red-700 px-3 py-1 text-red-700"
          @click="loadZipData()"
        >
          Retry
        </button>
      </div>

      <p v-else-if="zips.length === 0" class="mt-6 text-center">
        No clients found.
      </p>

      <template v-else>
        <table class="mt-6 min-w-full rounded shadow-md">
          <thead class="bg-gray-50 text-xl">
            <tr>
              <th class="p-4 text-left">Zip Number</th>
              <th class="p-4 text-left">Client Count</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-300">
            <tr v-for="zip in zips" :key="zip._id">
              <td class="p-2 text-left">{{ zip._id }}</td>
              <td class="p-2 text-left">{{ zip.count }}</td>
            </tr>
          </tbody>
        </table>

        <div class="mt-8 flex justify-center">
          <ZipChart :label="zipLabels" :chart-data="zipChartData" />
        </div>
      </template>
    </section>
  </main>
</template>



<script setup>
import { computed, onMounted } from 'vue'
import AttendanceChart from '../components/barChart.vue'
import ZipChart from '../components/donutZipChart.vue'
import { getAttendance, getClientsByZipCode } from '../api/api'
import { useApi } from '../composables/useApi'

const {
  data: attendanceData,
  loading,
  error: attendanceErrorMessage,
  execute: loadAttendance,
} = useApi(() => getAttendance())

const {
  data: zipData,
  loading: zipLoading,
  error: zipErrorMessage,
  execute: loadZipData,
} = useApi(() => getClientsByZipCode())

const recentEvents = computed(() => attendanceData.value || [])
const zips = computed(() => zipData.value || [])

const labels = computed(() =>
  recentEvents.value.map(
    (item) => `${item.name} (${formatDate(item.date)})`
  )
)

const chartData = computed(() =>
  recentEvents.value.map((item) => item.attendees.length)
)

const zipLabels = computed(() =>
  zips.value.map((item) => item._id)
)

const zipChartData = computed(() =>
  zips.value.map((item) => item.count)
)

const error = computed(() =>
  attendanceErrorMessage.value
    ? {
        title: 'Unable to Load Attendance',
        message: attendanceErrorMessage.value,
      }
    : null
)

const zipError = computed(() =>
  zipErrorMessage.value
    ? {
        title: 'Unable to Load Clients by ZIP Code',
        message: zipErrorMessage.value,
      }
    : null
)

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')

  return `${month}/${day}/${year}`
}

onMounted(() => {
  loadAttendance()
  loadZipData()
})
</script>
