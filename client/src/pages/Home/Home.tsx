// UserInfo.tsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-8';
import CallToAction from '@/components/call-to-action';
import WallOfLoveSection from '@/components/testimonials';
import FooterSection from '@/components/footer';

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
      <FeaturesSection />
      <WallOfLoveSection />
      <CallToAction />
      <FooterSection />
    </div>
  );
};

export default Home;
