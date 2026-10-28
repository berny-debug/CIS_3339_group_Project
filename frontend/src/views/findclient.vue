<!-- This view displays a list of clients. The user can search for clients, and click on a client to redirect to another component to view that client's information -->
<template>
  <main>
    <div>
      <!--Header-->
      <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
        Find Client
      </h1>
    </div>
    <div class="px-10 pt-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        <!--Search Client By selection-->
        <h2 class="text-2xl font-bold">Search Client By</h2>
        <!-- Displays Client Name search field -->
        <div class="flex flex-col">
          <select
            class="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            v-model="searchBy">
            <option value="Client Name">Client Name</option>
            <option value="Client Number">Client Number</option>
          </select>
        </div>
        <!--Input box for searching by Client First Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="firstName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter first name" />
          </label>
        </div>
        <!--Input box for searching by Client Last Name-->
        <div class="flex flex-col" v-if="searchBy === 'Client Name'">
          <label class="block">
            <input type="text"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              v-model="lastName" v-on:keyup.enter="handleSubmitForm" placeholder="Enter last name" />
          </label>
        </div>
        <!-- Displays Client Number search field -->
        <div class="flex flex-col" v-if="searchBy === 'Client Number'">
          <input
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            type="text" v-model="phoneNumber" v-on:keyup.enter="handleSubmitForm"
            placeholder="Enter Client Phone Number" />
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
          <!--Search Client button-->
          <button class="bg-red-700 text-white rounded" @click="handleSubmitForm" type="submit">
            Search Client
          </button>
        </div>
      </div>
    </div>

    <hr class="mt-10 mb-10" />
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
      <div class="ml-10">
        <h2 class="text-2xl font-bold">List of Clients</h2>
        <h3 class="italic">Click table row to view client details</h3>
      </div>
      <!--Table showing list of Clients-->
      <div class="flex flex-col col-span-2">
        <p v-if="loading" class="py-4 text-center" role="status">
          Loading clients...
        </p>

        <div v-else-if="error" class="py-4 text-center text-red-700" role="alert">
          <p>{{ error }}</p>
          <button
            class="mt-2 rounded border border-red-700 px-3 py-1"
            type="button"
            @click="execute()"
          >
            Retry
          </button>
      </div>

        <DataTable
          v-if="!loading && !error && clients"
          :columns="clientColumns"
          :rows="clientRows"
          @row-click="$router.push({
            name: 'clientdetails',
            params: { id: $event._id }
          })"
        />
      </div>
    </div>
  </main>
</template>


<script setup>
import { ref, computed, onMounted } from 'vue'
import DataTable from '../components/DataTable.vue'
import { getClients, searchClients } from '../api/api'
import { useApi } from '../composables/useApi'

const searchBy = ref('')
const firstName = ref('')
const lastName = ref('')
const phoneNumber = ref('')

const {
  data: clients,
  loading,
  error,
  execute,
} = useApi(() => getClients())
const clientColumns = [
  { label: 'Name', key: 'name' },
  { label: 'Phone number', key: 'phone' },
  { label: 'City', key: 'city' }
]

const clientRows = computed(() =>
  (clients.value ?? []).map(client => ({
    _id: client._id,
    name: `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim(),
    phone: client.phoneNumber?.primary ?? '',
    city: client.address?.city ?? ''
  }))
)
async function loadData() {
  searchBy.value = ''
  firstName.value = ''
  lastName.value = ''
  phoneNumber.value = ''

  await execute()
}

async function handleSubmitForm() {
  let query = null

  if (searchBy.value === 'Client Name') {
    if (!firstName.value && !lastName.value) return

    query = {
      searchBy: 'name',
      firstName: firstName.value,
      lastName: lastName.value,
    }
  } else if (searchBy.value === 'Client Number') {
    if (!phoneNumber.value) return

    query = {
      searchBy: 'number',
      phoneNumber: phoneNumber.value,
    }
  }

  if (!query) return

  await execute(() => searchClients(query))
}

onMounted(() => {
  execute()
})
</script>
