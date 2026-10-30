import jwt_decode from 'jwt-decode'

export const TOKEN_KEY = 'authToken'

// Looks at a JWT and reports whether it can be trusted for restoring a session.
// Returns { payload, reason }: payload is the decoded token when it is usable, otherwise null and
// reason is 'missing', 'invalid' (corrupted or incomplete) or 'expired'.
export function inspectToken(token) {
  if (typeof token !== 'string' || !token) return { payload: null, reason: 'missing' }

  let payload
  try {
    payload = jwt_decode(token)
  } catch {
    return { payload: null, reason: 'invalid' }
  }

  // the backend always signs name, role and an expiry into the token
  if (
    !payload ||
    typeof payload.name !== 'string' ||
    typeof payload.role !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return { payload: null, reason: 'invalid' }
  }

  if (payload.exp * 1000 <= Date.now()) return { payload: null, reason: 'expired' }

  return { payload, reason: null }
}

// Decodes a JWT and returns its payload, or null if the token is missing, corrupted, incomplete or expired
export function decodeToken(token) {
  return inspectToken(token).payload
}

// Saves a token to localStorage. Returns false if storage is unavailable.
export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
    return true
  } catch {
    return false
  }
}

// Removes the saved token. Safe to call when nothing is stored or storage is unavailable.
export function clearStoredToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable: nothing to clear
  }
}

// Reads the saved token from localStorage and returns { session, reason }.
// session is { token, payload } when the token is still good, otherwise null with a reason
// ('missing', 'invalid' or 'expired'). A bad token is removed, so callers can treat the user as logged out.
export function getStoredSession() {
  let token = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch {
    return { session: null, reason: 'missing' }
  }

  const { payload, reason } = inspectToken(token)
  if (!payload) {
    clearStoredToken()
    return { session: null, reason }
  }

  return { session: { token, payload }, reason: null }
}
