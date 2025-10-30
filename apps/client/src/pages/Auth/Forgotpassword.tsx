import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  onBack?: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'enterEmail' | 'enterCode'>('enterEmail');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  if (!isLoaded) {
    return null;
  }

  const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      console.log('Requesting password reset code for:', email);
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setMessage('Password reset code sent! Please check your email.');
      setStep('enterCode');
    } catch (err) {
      console.error('Error sending password reset code:', err);
      setError('Failed to send password reset code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      console.log('Attempting to reset password for:', email);
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      if (result.status === 'needs_second_factor') {
        console.log('Additional authentication required.');
        setError('Additional authentication required.');
      } else if (result.status === 'complete') {
        console.log('Password reset successful for:', email);
        toast.success('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          onBack ? onBack() : navigate('/login');
        }, 1500);
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setError('Failed to reset password.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {step === 'enterEmail' && (
        <form onSubmit={handleSendCode} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-2xl font-bold">Forgot Password</h2>
            <p className="text-iridium md:text-sm">
              Enter your registered email to receive a reset code.
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="forgotEmail">Email</Label>
            <Input
              id="forgotEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <Button type="submit" className="w-full">
            Send Reset Code
          </Button>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={onBack}
            >
              Back to Login
            </Button>
          )}
        </form>
      )}

      {step === 'enterCode' && (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-start">
            <h2 className="text-2xl font-bold">Reset Password</h2>
            <p className="text-iridium md:text-sm">
              A reset code was sent to {email}. Please enter it along with your new
              password.
            </p>
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="code">Reset Code</Label>
            <Input
              id="code"
              type="text"
              placeholder="Enter reset code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2 text-start">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600">{error}</p>}
          {message && <p className="text-green-600">{message}</p>}
          <Button type="submit" className="w-full">
            Reset Password
          </Button>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={onBack}
            >
              Back to Login
            </Button>
          )}
        </form>
      )}
    </div>
  );
}