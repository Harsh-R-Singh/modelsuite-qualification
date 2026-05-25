import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Placeholder dashboards — built in subsequent prompts
const AdminDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', color: '#f0eeff', background: '#0f0e17', minHeight: '100vh' }}>
    <h1>🛠 Admin Dashboard</h1>
    <p style={{ color: '#9490b8', marginTop: '8px' }}>Coming soon — task management features will be added next.</p>
  </div>
);

const TalentDashboard = () => (
  <div style={{ padding: '40px', fontFamily: 'Inter, sans-serif', color: '#f0eeff', background: '#0f0e17', minHeight: '100vh' }}>
    <h1>🎯 Talent Dashboard</h1>
    <p style={{ color: '#9490b8', marginTop: '8px' }}>Coming soon — your assigned tasks will appear here.</p>
  </div>
);

// Intentional gap: PrivateRoute does NOT check token expiry — only checks presence
const PrivateRoute = ({ children, role }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="Admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/talent/dashboard"
            element={
              <PrivateRoute role="Talent">
                <TalentDashboard />
              </PrivateRoute>
            }
          />
          {/* Intentional gap: no 404 catch-all route */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
