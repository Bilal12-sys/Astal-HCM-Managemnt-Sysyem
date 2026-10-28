import AstralMark from '../assets/AstralMark.jsx';
// This component explains when a feature has no records or is not implemented yet.
function EmptyState({ title, message }) { return <section className="glass-card mx-auto max-w-lg p-8 text-center"><AstralMark className="mx-auto h-20 w-20" /><h1 className="mt-4 font-display text-2xl font-bold">{title}</h1><p className="mt-2 text-[var(--muted)]">{message}</p></section>; }
export default EmptyState;
