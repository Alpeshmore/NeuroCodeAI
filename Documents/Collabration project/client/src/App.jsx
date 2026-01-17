import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyDashboard from './pages/CompanyDashboard';
import DeveloperDashboard from './pages/DeveloperDashboard';
import ProjectDetails from './pages/ProjectDetails';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardRouter />
              </PrivateRoute>
            } />
            
            <Route path="/projects/:id" element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function DashboardRouter() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.role === 'company' ? <CompanyDashboard /> : <DeveloperDashboard />;
}

export default App;
