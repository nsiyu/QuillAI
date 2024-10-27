import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from '@supabase/auth-helpers-react'
import Landing from './components/Landing'
import Login from './components/Login'
import Home from './components/Home'
import Profile from './components/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  const session = useSession();

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={session ? <Navigate to="/home" replace /> : <Landing />} 
          />
          <Route 
            path="/login" 
            element={session ? <Navigate to="/home" replace /> : <Login />} 
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
