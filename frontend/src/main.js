import { createApp, markRaw } from "vue";
import router from "./router";
import App from "./App.vue";
import "./index.css";
import Toast, { useToast } from "vue-toastification";
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";
//state management library
import { pinia } from './store/pinia'
import { useLoggedInUserStore } from './store/loggedInUser'

const app = createApp(App);

//pinia should be able to use router - has to be setup as plugin
pinia.use(({ store }) => {
  store.$router = markRaw(router)
});

//add pinia object to our instance
app.use(pinia)

// restore the login session from a saved token before the router runs its first navigation guard
const sessionStore = useLoggedInUserStore()
const sessionStatus = sessionStore.restoreSession()

app.use(router);

const options = {
  position: 'bottom-right'
};
app.use(Toast, options);

// keep several open tabs in step when the saved token is added or removed in one of them
window.addEventListener('storage', (event) => sessionStore.handleStorageEvent(event))

app.mount("#app");

// a token that was found but had expired: tell the user why they are logged out
if (sessionStatus === 'expired') {
  useToast().info("Your session has expired. Please log in again.")
}
