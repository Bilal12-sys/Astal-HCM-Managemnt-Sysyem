import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AstralMark from '../../assets/AstralMark.jsx';
import { login } from '../../api/authApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import Button from '../../components/Button.jsx';

// This function returns the correct home page for a signed-in role.
function getHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'hr') return '/hr';
  return '/me';
}

// This component signs a user in with the confirmed backend login endpoint.
function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // This function updates one input in the login form.
  function updateValue(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  // This function sends the form to the backend and saves the returned session.
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(values);
      signIn(response.data);
      navigate(response.data.user.mustChangePassword ? '/change-password' : getHome(response.data.user.role));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return <div className="astral-background grid min-h-screen place-items-center p-5"><section className="glass-card w-full max-w-md p-7 md:p-9"><Link to="/" className="flex items-center gap-3"><AstralMark className="h-12 w-12" /><span className="font-display text-sm font-bold">Astral Technologies</span></Link><p className="mt-8 text-sm font-semibold text-[var(--astral-600)]">HCM Lite</p><h1 className="mt-2 font-display text-3xl font-bold">Welcome back</h1><p className="mt-2 text-sm text-[var(--muted)]">Sign in to open your workspace.</p><form className="mt-7 grid gap-5" onSubmit={handleSubmit}><label className="grid gap-2 text-sm font-semibold">Email<input className="rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2.5 text-[var(--ink)]" type="email" name="email" value={values.email} onChange={updateValue} autoComplete="email" required /></label><label className="grid gap-2 text-sm font-semibold">Password<input className="rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2.5 text-[var(--ink)]" type="password" name="password" value={values.password} onChange={updateValue} autoComplete="current-password" required /></label>{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button></form><p className="mt-6 text-center text-sm text-[var(--muted)]">Need to create the first admin? <Link to="/setup" className="font-semibold text-[var(--astral-600)]">Start setup</Link></p></section></div>;
}

export default LoginPage;
