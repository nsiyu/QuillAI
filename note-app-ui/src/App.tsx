import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useSession } from '@supabase/auth-helpers-react'
import Landing from './components/Landing'
import Login from './components/Login'
import Home from './components/Home'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const session = useSession();

  return (
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
