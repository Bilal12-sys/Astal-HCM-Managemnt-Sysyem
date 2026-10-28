import { Link } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
// This component explains when a role cannot open a page.
function ForbiddenPage() { return <div className="astral-background grid min-h-screen place-items-center p-5"><div><EmptyState title="This area is protected" message="Your current role does not have access to this page." /><Link to="/" className="mt-4 block text-center"><Button>Return home</Button></Link></div></div>; }
export default ForbiddenPage;
