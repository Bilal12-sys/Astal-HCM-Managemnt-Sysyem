// This component provides consistent Astral button styles.
function Button({ children, variant = 'primary', className = '', ...props }) { const styles = { primary: 'ribbon-button', secondary: 'border border-[var(--border)] bg-[var(--surface)] text-[var(--ink)]' }; return <button className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-[.97] ${styles[variant]} ${className}`} {...props}>{children}</button>; }
export default Button;
