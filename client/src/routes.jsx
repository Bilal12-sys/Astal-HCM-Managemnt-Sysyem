import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute.jsx';
import PublicOnlyRoute from './auth/PublicOnlyRoute.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import EmployeeLayout from './layouts/EmployeeLayout.jsx';
import HRLayout from './layouts/HRLayout.jsx';
import PublicLayout from './layouts/PublicLayout.jsx';
import ForbiddenPage from './pages/shared/ForbiddenPage.jsx';
import LandingPage from './pages/landing/LandingPage.jsx';
import NotFoundPage from './pages/shared/NotFoundPage.jsx';
import PlaceholderPage from './pages/shared/PlaceholderPage.jsx';

// This component defines the public and role-based route groups.
export function AppRoutes() { return <Routes><Route element={<PublicLayout />}><Route index element={<LandingPage />} /><Route element={<PublicOnlyRoute />}><Route path="setup" element={<PlaceholderPage title="Set up your organization" />} /><Route path="login" element={<PlaceholderPage title="Welcome back" />} /></Route><Route path="change-password" element={<PlaceholderPage title="Create a new password" />} /><Route path="403" element={<ForbiddenPage />} /></Route><Route element={<ProtectedRoute roles={['admin']} />}><Route path="admin" element={<AdminLayout />}><Route index element={<PlaceholderPage title="Admin dashboard" />} /><Route path="*" element={<PlaceholderPage title="Admin workspace" />} /></Route></Route><Route element={<ProtectedRoute roles={['hr']} />}><Route path="hr" element={<HRLayout />}><Route index element={<PlaceholderPage title="HR dashboard" />} /><Route path="*" element={<PlaceholderPage title="HR workspace" />} /></Route></Route><Route element={<ProtectedRoute roles={['employee']} />}><Route path="me" element={<EmployeeLayout />}><Route index element={<PlaceholderPage title="My dashboard" />} /><Route path="*" element={<PlaceholderPage title="My workspace" />} /></Route></Route><Route path="*" element={<NotFoundPage />} /></Routes>; }
