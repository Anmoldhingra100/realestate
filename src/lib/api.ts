import axios from 'axios'
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'


// ==================================================
// API BASE URL
// ==================================================

const baseURL =
  import.meta.env.VITE_API_URL ||
  'http://192.168.1.33:8000/api'


// ==================================================
// AXIOS INSTANCE
// ==================================================

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})


// ==================================================
// CLEAR AUTH DATA
// ==================================================

function clearAuth() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('user')
}


// ==================================================
// REQUEST INTERCEPTOR
// Attach JWT access token automatically
// ==================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken =
      localStorage.getItem('access')

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)


// ==================================================
// RESPONSE INTERCEPTOR
// Refresh expired access token automatically
// ==================================================

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean
          })
        | undefined

    if (!originalRequest) {
      return Promise.reject(error)
    }


    // Prevent infinite refresh loops
    const isRefreshRequest =
      originalRequest.url?.includes(
        '/auth/refresh/'
      )

    const isLoginRequest =
      originalRequest.url?.includes(
        '/auth/token/'
      )

    const isRegisterRequest =
      originalRequest.url?.includes(
        '/auth/register/'
      )


    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshRequest &&
      !isLoginRequest &&
      !isRegisterRequest
    ) {
      originalRequest._retry = true

      const refreshToken =
        localStorage.getItem('refresh')


      // No refresh token
      if (!refreshToken) {
        clearAuth()

        window.dispatchEvent(
          new Event('auth-changed')
        )

        return Promise.reject(error)
      }


      try {
        // Your actual Django endpoint:
        // POST /api/auth/refresh/

        const response = await axios.post(
          `${baseURL}/auth/refresh/`,
          {
            refresh: refreshToken,
          }
        )


        const newAccessToken =
          response.data.access


        if (!newAccessToken) {
          clearAuth()

          window.dispatchEvent(
            new Event('auth-changed')
          )

          return Promise.reject(error)
        }


        // Save new access token
        localStorage.setItem(
          'access',
          newAccessToken
        )


        // Update the failed request
        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`


        // Retry original request
        return api(originalRequest)

      } catch (refreshError) {
        clearAuth()

        window.dispatchEvent(
          new Event('auth-changed')
        )

        return Promise.reject(
          refreshError
        )
      }
    }


    return Promise.reject(error)
  }
)


// ==================================================
// LOGIN
// POST /api/auth/token/
// ==================================================

export async function loginUser(
  username: string,
  password: string
) {
  const response = await api.post(
    '/auth/token/',
    {
      username,
      password,
    }
  )


  const access =
    response.data.access

  const refresh =
    response.data.refresh


  if (!access || !refresh) {
    throw new Error(
      'Login response did not contain access and refresh tokens.'
    )
  }


  // Save tokens
  localStorage.setItem(
    'access',
    access
  )

  localStorage.setItem(
    'refresh',
    refresh
  )


  return response.data
}


// ==================================================
// REGISTER TYPE
// ==================================================

export type RegisterData = {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}


// ==================================================
// REGISTER
// POST /api/auth/register/
// ==================================================

export async function registerUser(
  data: RegisterData
) {
  const response = await api.post(
    '/auth/register/',
    data
  )

  return response.data
}


// ==================================================
// LOGOUT
// ==================================================

export function logoutUser() {
  clearAuth()

  window.dispatchEvent(
    new Event('auth-changed')
  )
}


// ==================================================
// CHECK LOGIN STATUS
// ==================================================

export function isLoggedIn(): boolean {
  return Boolean(
    localStorage.getItem('access')
  )
}


// ==================================================
// GET ACCESS TOKEN
// ==================================================

export function getAccessToken():
  | string
  | null {
  return localStorage.getItem(
    'access'
  )
}


// ==================================================
// GET REFRESH TOKEN
// ==================================================

export function getRefreshToken():
  | string
  | null {
  return localStorage.getItem(
    'refresh'
  )
}


// ==================================================
// AUTH USER TYPE
// ==================================================

export type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
}


// ==================================================
// GET CURRENT LOGGED-IN USER
// GET /api/auth/me/
// ==================================================

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get('/auth/me/')

  const user: AuthUser = response.data

  // Save user details so they remain available
  // after refreshing the browser
  localStorage.setItem(
    'user',
    JSON.stringify(user)
  )

  return user
}


// ==================================================
// GET USER FROM LOCAL STORAGE
// ==================================================

export function getStoredUser(): AuthUser | null {
  const storedUser =
    localStorage.getItem('user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(
      storedUser
    ) as AuthUser
  } catch {
    localStorage.removeItem('user')
    return null
  }
}