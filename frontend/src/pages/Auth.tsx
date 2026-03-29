import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Button, Input } from '@/src/components/ui/TacticalUI';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { api } from '@/src/services/api';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await api.auth.login({ email, password });
      localStorage.setItem('fleetspy_token', response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-on-surface flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-container/5 -skew-x-12 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-64 h-64 border-t-2 border-r-2 border-primary-container/20 -translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 text-surface">
            <ShieldAlert className="w-12 h-12 text-primary-container" />
            <h1 className="text-4xl font-display tracking-tighter uppercase">FleetSpy</h1>
          </div>
        </div>

        <Card className="border-l-0 border-t-4 border-primary-container">
          <div className="mb-8">
            <h2 className="text-2xl font-display uppercase">Command Login</h2>
            <p className="text-outline text-xs mt-1 font-medium">Enter your credentials to access Sector 7 HQ.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="commander@fleetspy.io" 
              required 
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <Input 
              label="Access Key" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                variant="secondary" 
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Authorize Access'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              New Commander? <Link to="/register" className="text-primary hover:underline">Request Credentials</Link>
            </p>
          </div>
        </Card>

        <p className="mt-12 text-center text-[10px] font-mono text-outline/50 uppercase tracking-tighter">
          Secure Terminal // Encrypted TLS 1.3 // FleetSpy v4.0.1
        </p>
      </div>
    </div>
  );
};

export const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await api.auth.register({ email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-on-surface flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-primary-container/5 skew-x-12 -translate-x-1/4" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-3 text-surface">
            <ShieldAlert className="w-12 h-12 text-primary-container" />
            <h1 className="text-4xl font-display tracking-tighter uppercase">FleetSpy</h1>
          </div>
        </div>

        <Card className="border-l-0 border-t-4 border-primary-container">
          <div className="mb-8">
            <h2 className="text-2xl font-display uppercase">Request Access</h2>
            <p className="text-outline text-xs mt-1 font-medium">Register for a new command account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="commander@fleetspy.io" 
              required 
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <Input 
              label="Access Key" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
            />
            <Input 
              label="Confirm Key" 
              type="password" 
              placeholder="••••••••" 
              required 
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
            />
            
            <div className="pt-4">
              <Button 
                type="submit" 
                variant="secondary" 
                className="w-full flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Request Credentials'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-outline-variant text-center">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Already Registered? <Link to="/login" className="text-primary hover:underline">Command Login</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
