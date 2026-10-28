import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// This component blocks private pages until a matching role is authenticated.
function ProtectedRoute({ roles }) { const { user, loading } = useAuth(); if (loading) return <div className="astral-background grid min-h-screen place-items-center">Loading…</div>; if (!user) return <Navigate to="/login" replace />; return roles.includes(user.role) ? <Outlet /> : <Navigate to="/403" replace />; }
export default ProtectedRoute;
