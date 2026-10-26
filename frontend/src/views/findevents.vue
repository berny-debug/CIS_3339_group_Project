<!-- This view displays a list of events. Users can search for events, and click on an event to be redirected to another component to view that event's details -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        List of Events
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <h2 class="text-2xl font-bold">Search Event By</h2>
        <!-- Displays Event Name or Event Date selection -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Event Name">Event Name</option>
            <option value="Event Date">Event Date</option>
          </select>
        </div>
        <!--Displays event name search field-->
        <div class="flex flex-col" v-if="searchBy === 'Event Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="name" v-on:keyup.enter="handleSubmitForm" placeholder="Enter event name" />
          </label>
        </div>
        <!-- Displays event date search field -->
        <div class="flex flex-col" v-if="searchBy === 'Event Date'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="date" v-model="eventDate" v-on:keyup.enter="handleSubmitForm" />
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <div></div>
        <div></div>
        <!--Clear Search button-->
        <div class="mt-5 grid-cols-2">
          <button class="mr-10 border border-red-700 bg-white text-red-700 rounded" @click="loadData" type="submit">
            Clear Search
          </button>
          <!--Search Event button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Event
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />

<!-- Display Found Data -->
<div class="mt-10 px-10">
  <h2 class="text-2xl font-bold">List of Events</h2>
  <h3 class="italic">Click a table row to view event details</h3>

  <!-- Loading state -->
  <p v-if="loading" class="mt-4" role="status">
    Loading events...
  </p>

  <!-- Error state and retry -->
  <div v-else-if="error" class="mt-4" role="alert">
    <p class="text-red-700">{{ error }}</p>
    <button
      class="mt-2 rounded border border-red-700 px-3 py-1 text-red-700"
      type="button"
      @click="execute()"
    >
      Retry
    </button>
  </div>

  <!-- Empty state -->
  <p v-else-if="events && events.length === 0" class="mt-4">
    No events found.
  </p>

  <!-- Events table -->
  <table
    v-else-if="events"
    class="mt-4 min-w-full shadow-md rounded"
  >
    <thead class="bg-gray-50 text-xl">
      <tr>
        <th class="p-4 text-left">Event Name</th>
        <th class="p-4 text-left">Event Date</th>
        <th class="p-4 text-left">Event Address</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-300">
      <tr
        v-for="event in events"
        :key="event._id"
        @click="$router.push({ name: 'eventdetails', params: { id: event._id } })"
        class="cursor-pointer"
        :class="{ hoverRow: hoverId === event._id }"
        @mouseenter="hoverId = event._id"
        @mouseleave="hoverId = null"
      >
        <td class="p-2 text-left">{{ event.name }}</td>
        <td class="p-2 text-left">{{ formatDate(event.date) }}</td>
        <td class="p-2 text-left">{{ event.address?.line1 || 'No address available' }}</td>
      </tr>
    </tbody>
  </table>
</div>

  </main>
</template>


<script setup>
import { ref, onMounted } from 'vue'
import { getEvents, searchEvents } from '../api/api'
import { useApi } from '../composables/useApi'

const searchBy = ref('Event Name')
const name = ref('')
const eventDate = ref('')
const hoverId = ref(null)

const {
  data: events,
  loading,
  error,
  execute,
} = useApi(() => getEvents())

async function loadData() {
  searchBy.value = 'Event Name'
  name.value = ''
  eventDate.value = ''
  await execute()
}

async function handleSubmitForm() {
  let query = null

  if (searchBy.value === 'Event Name') {
    if (!name.value.trim()) return

    query = {
      searchBy: 'name',
      name: name.value,
    }
  } else if (searchBy.value === 'Event Date') {
    if (!eventDate.value) return

    const date = new Date(`${eventDate.value}T00:00:00Z`)
    const formattedDate = date.toISOString().substring(0, 10)

    query = {
      searchBy: 'date',
      eventDate: formattedDate,
    }
  }

  if (query) {
    await execute(() => searchEvents(query))
  }
}

function formatDate(date) {
  const isoDate = new Date(date)
  const year = isoDate.getUTCFullYear()
  const month = String(isoDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(isoDate.getUTCDate()).padStart(2, '0')

  return `${month}/${day}/${year}`
}

onMounted(() => {
  execute()
})
</script>
