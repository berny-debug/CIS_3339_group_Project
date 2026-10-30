import jwt_decode from 'jwt-decode'

export const TOKEN_KEY = 'authToken'

// Decodes a JWT and returns its payload, or null if the token is corrupted, incomplete or expired
export function decodeToken(token) {
  if (typeof token !== 'string' || !token) return null

  let payload
  try {
    payload = jwt_decode(token)
  } catch {
    return null
  }

  // the backend always signs name, role and an expiry into the token
  if (!payload || typeof payload.name !== 'string' || typeof payload.role !== 'string') return null
  if (typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now()) return null

  return payload
}

// Reads the saved token from localStorage. A missing, corrupted or expired token is removed
// and null is returned, so callers can treat the user as logged out.
export function getStoredSession() {
  let token = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }

  const payload = decodeToken(token)
  if (!payload) {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // storage unavailable: nothing to clear
    }
    return null
  }

  return { token, payload }
}
