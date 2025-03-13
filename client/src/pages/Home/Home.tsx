// UserInfo.tsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import HeroSection from '@/components/hero-section';

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
      <HeroSection />
    </div>
  );
};

export default Home;
