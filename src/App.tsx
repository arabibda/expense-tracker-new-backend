import { BrowserRouter, useLocation } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { Footer } from './pages/Components/Footer'

const AppContent = () => {
  const location = useLocation()
  const hideFooter = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/add-plan' || location.pathname === '/add-income'

  return (
    <>
      <AppRoutes />
      {!hideFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter >
      <AppContent />
    </BrowserRouter>
  )
}

export default App
