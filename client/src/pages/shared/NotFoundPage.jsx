import { Link } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import EmptyState from '../../components/EmptyState.jsx';
// This component explains when a requested address does not exist.
function NotFoundPage() { return <div className="astral-background grid min-h-screen place-items-center p-5"><div><EmptyState title="This star is off the map" message="The page you requested does not exist." /><Link to="/" className="mt-4 block text-center"><Button>Return home</Button></Link></div></div>; }
export default NotFoundPage;
