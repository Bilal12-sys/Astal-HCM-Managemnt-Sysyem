import { Link, Outlet } from 'react-router-dom';
import AstralMark from '../assets/AstralMark.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

// This component is the shared shell for each protected role.
function RoleLayout({ label, home }) { const { user, signOut } = useAuth(); const { theme, setTheme } = useTheme(); return <div className="astral-background min-h-screen"><header className="flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 md:px-10"><Link to={home} className="flex items-center gap-2"><AstralMark className="h-10 w-10" /><span className="font-display text-sm font-bold">Astral · {label}</span></Link><div className="flex items-center gap-3"><button aria-label="Toggle theme" onClick={() => setTheme(theme === 'night' ? 'daylight' : 'night')} className="text-sm">{theme === 'night' ? 'Daylight' : 'Night'}</button><button onClick={signOut} className="text-sm text-[var(--muted)]">{user?.name} · Sign out</button></div></header><main className="mx-auto max-w-7xl p-5 md:p-10"><Outlet /></main></div>; }
export default RoleLayout;
