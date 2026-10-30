// This pinia store contains state with respect to whether a user is logged in
import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { loginUser, logoutUser, restoreAuthHeader } from '../api/api' // import API calls
import { decodeToken, getStoredSession, TOKEN_KEY } from '../utils/token'

//Notifications
const toast = useToast()

// Only allow redirects to paths inside this app (never "//host" or "/\host" style links)
function safeRedirect(target) {
  const ok =
    typeof target === 'string' &&
    target.startsWith('/') &&
    !target.startsWith('//') &&
    !target.startsWith('/\\')
  return ok ? target : '/'
}

// Defining a store
export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',
  state: () => {
    return {
      name: "",
      role: "",
      isLoggedIn: false
    }
  },
  actions: {
    resetSession() {
      this.$patch({
        name: "",
        role: "",
        isLoggedIn: false
      });
    },

    // Puts the details from a decoded token into the store
    applySession(payload) {
      this.$patch({
        isLoggedIn: true,
        role: payload.role,
        name: payload.name
      });
    },

    // Called once on startup: restores the login state from a saved, still-valid token.
    // A missing, corrupted or expired token leaves the user cleanly logged out.
    // Returns 'restored', or the reason the session was not restored ('missing', 'invalid', 'expired').
    restoreSession() {
      const { session, reason } = getStoredSession();
      if (!session) {
        logoutUser();
        this.resetSession();
        return reason;
      }

      restoreAuthHeader(session.token);
      this.applySession(session.payload);
      return 'restored';
    },

    // True while the saved token is still good. Used by the router guard so a token that
    // expires (or is removed) while the app is open is noticed on the next navigation.
    hasValidSession() {
      return getStoredSession().session !== null;
    },

    // Ends a session whose token is no longer valid and tells the user why
    expireSession() {
      logoutUser();
      this.resetSession();
      toast.info("Your session has expired. Please log in again.");
    },

    // Shown when a non-editor tries to open an editor-only page
    denyAccess() {
      toast.error("You don't have permission to view that page.");
    },

    async login(username, password) {
      try {
        // loginUser only saves the token if it is a valid, unexpired JWT
        const token = await loginUser(username, password);
        // Get the user's name and role from the JWT token
        this.applySession(decodeToken(token));
        // go back to the page the user was trying to reach, or home
        const redirect = safeRedirect(this.$router.currentRoute.value.query.redirect);
        this.$router.push(redirect);
        toast.success("Login Sucessful!")

      } catch ( error ) {
        toast.error(error.message)
      }
    },
    logout() {
      // clears the saved token and the Authorization header, then the Pinia session state
      logoutUser();
      this.resetSession();
      this.$router.push("/");
      toast.info("You have been logged out!")
    },

    // Keeps several open tabs in step: when the saved token changes in another tab
    // (login, logout or token removal), this tab follows.
    handleStorageEvent(event) {
      // event.key is null when storage was cleared entirely
      if (event.key !== null && event.key !== TOKEN_KEY) return;

      const { session } = getStoredSession();
      if (session) {
        restoreAuthHeader(session.token);
        this.applySession(session.payload);
      } else if (this.isLoggedIn) {
        logoutUser();
        this.resetSession();
        toast.info("You have been logged out in another tab.");
        this.$router.push("/login");
      }
    }
  },
});
