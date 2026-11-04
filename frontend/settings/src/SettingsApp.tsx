import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '@orderportal/shared-store';

export default function SettingsApp(): React.JSX.Element {
  const user = useSelector(selectUser);

  return (
    <section>
      <h1>Settings</h1>
      <article className="card">
        <p>Signed in as <strong>{user?.email ?? 'Unknown user'}</strong></p>
        <p>Role: {user?.role ?? '—'}</p>
        <p>API endpoint: http://localhost:3000/api</p>
        <p>The JWT is held in the shared Redux store for this browser session.</p>
      </article>
    </section>
  );
}
