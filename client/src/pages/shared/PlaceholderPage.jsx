import EmptyState from '../../components/EmptyState.jsx';
// This component holds a simple place for an upcoming focused screen.
function PlaceholderPage({ title }) { return <EmptyState title={title} message="This client screen will connect only to confirmed backend endpoints." />; }
export default PlaceholderPage;
