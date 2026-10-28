import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// This component sends signed-in users to their role home.
function PublicOnlyRoute() { const { user } = useAuth(); if (!user) return <Outlet />; return <Navigate to={user.role === 'admin' ? '/admin' : user.role === 'hr' ? '/hr' : '/me'} replace />; }
export default PublicOnlyRoute;
