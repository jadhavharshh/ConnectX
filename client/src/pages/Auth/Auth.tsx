// Auth.tsx
import React, { useState } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';

type AuthMode = 'signIn' | 'signUp';

const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem' }}>
        <button onClick={() => setMode('signIn')}>Sign In</button>
        <button onClick={() => setMode('signUp')}>Sign Up</button>
      </div>
      {mode === 'signIn' ? <SignInForm /> : <SignUpForm />}
    </div>
  );
};

const SignInForm: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  if (!isLoaded || !signIn) {
    return <div>Loading...</div>;
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // In the React SDK, use create for email/password sign in.
      const result = await signIn.create({
        identifier: email,
        password,
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Redirect after successful sign in.
        window.location.href = '/';
      } else {
        console.log('Sign in incomplete:', result);
      }
    } catch (error: any) {
      console.error('Sign in error:', error.errors || error);
    }
  };

  return (
    <form onSubmit={handleSignIn}>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          required
        />
      </div>
      <div style={{ marginTop: '0.5rem' }}>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
        />
      </div>
      <button type="submit" style={{ marginTop: '1rem' }}>
        Sign In
      </button>
    </form>
  );
};

const SignUpForm: React.FC = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'register' | 'verify'>('register');

  if (!isLoaded || !signUp) {
    return <div>Loading...</div>;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Create a new account.
      await signUp.create({
        emailAddress: email,
        password,
      });
      // Send a verification code via email.
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (error: any) {
      console.error('Sign up error:', error.errors || error);
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code: otp });
      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        // Redirect after successful sign up.
        window.location.href = '/';
      } else {
        console.log('Verification incomplete:', completeSignUp);
      }
    } catch (error: any) {
      console.error('Verification error:', error.errors || error);
    }
  };

  return (
    <div>
      {step === 'register' ? (
        <form onSubmit={handleSignUp}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              required
            />
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>
            Sign Up
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <div>
            <label>Verification Code:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              required
            />
          </div>
          <button type="submit" style={{ marginTop: '1rem' }}>
            Verify Email
          </button>
        </form>
      )}
    </div>
  );
};

export default Auth;
