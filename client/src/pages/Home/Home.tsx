// UserInfo.tsx
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-8';
import CallToAction from '@/components/call-to-action';
import WallOfLoveSection from '@/components/testimonials';
import FooterSection from '@/components/footer';
import LoadingLoop from '@/components/ui/LoadingLoop';

const Home: React.FC = () => {
  const { isLoaded } = useUser();
  if (!isLoaded) {
    return <LoadingLoop />;
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
