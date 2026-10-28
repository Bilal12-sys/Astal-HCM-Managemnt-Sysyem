import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AstralMark from '../../assets/AstralMark.jsx';
import { completeSetup } from '../../api/setupApi.js';
import Button from '../../components/Button.jsx';

// This component creates the initial organization and admin account.
function SetupPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ companyName: '', adminName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // This function updates one setup field.
  function updateValue(event) { setValues({ ...values, [event.target.name]: event.target.value }); }

  // This function submits the first-admin setup to the confirmed backend endpoint.
  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try { await completeSetup(values); setSuccess('Your organization is ready. Please sign in.'); window.setTimeout(() => navigate('/login'), 1000); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }

  return <div className="astral-background grid min-h-screen place-items-center p-5"><section className="glass-card w-full max-w-lg p-7 md:p-9"><Link to="/" className="flex items-center gap-3"><AstralMark className="h-12 w-12" /><span className="font-display text-sm font-bold">Astral Technologies</span></Link><h1 className="mt-8 font-display text-3xl font-bold">Set up your organization</h1><p className="mt-2 text-sm text-[var(--muted)]">Create the first admin account for HCM Lite.</p><form className="mt-7 grid gap-4" onSubmit={handleSubmit}>{[['companyName', 'Company name', 'text'], ['adminName', 'Admin name', 'text'], ['email', 'Email', 'email'], ['password', 'Password', 'password']].map(([name, label, type]) => <label key={name} className="grid gap-2 text-sm font-semibold">{label}<input className="rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2.5 text-[var(--ink)]" name={name} type={type} value={values[name]} onChange={updateValue} minLength={name === 'password' ? 8 : undefined} required /></label>)}{error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}{success && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>}<Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create organization'}</Button></form></section></div>;
}

export default SetupPage;
