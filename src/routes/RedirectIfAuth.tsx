import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

export const RedirectIfAuth = ({ children }: { children: ReactNode }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }
  return children
}
