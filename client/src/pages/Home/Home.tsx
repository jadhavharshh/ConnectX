// UserInfo.tsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';

const Home: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading user info...</div>;
  }

  if (!isSignedIn || !user) {
    return <div>No user is signed in.</div>;
  }

  return (
    <div>
      <h2>User Information</h2>
      <p>
        <strong>First Name:</strong> {user.firstName}
      </p>
      <p>
        <strong>Last Name:</strong> {user.lastName}
      </p>
      <p>
        <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
      </p>
      <p>
        <strong>User ID:</strong> {user.id}
      </p>
    </div>
  );
};

export default Home;
