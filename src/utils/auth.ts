const AUTH_KEY = 'isAuthenticated'
const USER_ID_KEY = 'userId'

export const setAuthenticated = (userId: string) => {
  sessionStorage.setItem(AUTH_KEY, 'true')
  sessionStorage.setItem(USER_ID_KEY, userId)
}

export const clearAuthenticated = () => {
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(USER_ID_KEY)
}

export const isAuthenticated = () => {
  return sessionStorage.getItem(AUTH_KEY) === 'true'
}

export const getUserId = () => sessionStorage.getItem(USER_ID_KEY)
