import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/context/AuthContext'
import { ThemeProvider } from './theme/ThemeProvider'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
export default App
