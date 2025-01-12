import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useLanguage } from '../context/LanguageContext';

const EmailForPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {authFetch} = useAuthenticatedFetch();
  const {t} = useLanguage()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Replace this with your actual API call
      const response = await fetch(`http://45.9.191.191/api/v1/password-reset-request/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      // Navigate to OTP verification page
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(t('auth.failedToSendOTP'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-3xl font-bold text-center">
            {t('auth.resetPassword')}
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.enterEmail')}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">{error}</div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full text-white"
            >
              {isLoading ? t('auth.sending') : t('auth.sendVerificationCode')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailForPasswordReset;
