import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }
  return children
}
