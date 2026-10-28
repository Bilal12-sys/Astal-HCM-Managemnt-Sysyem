import { Outlet } from 'react-router-dom';
// This component provides the public page background.
function PublicLayout() { return <main className="astral-background min-h-screen"><Outlet /></main>; }
export default PublicLayout;
