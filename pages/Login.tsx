import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
    const { t } = useTranslation('auth');
    const { signIn, signUp } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignUp) {
                await signUp(email, password);
                setError(t('signup.verifyEmail'));
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            setError(err.message || t('errors.generic'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-md px-md py-lg sm:p-xl">
                {/* Logo */}
                <div className="flex items-center justify-center gap-sm mb-lg sm:mb-xl">
                    <div className="p-xs bg-foreground text-background rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-heading font-bold tracking-tight">EVOQUE</h1>
                </div>

                {/* Card */}
                <div className="bg-card rounded-2xl shadow-xl border border-border p-lg sm:p-xl">
                    <h2 className="text-heading font-semibold text-card-foreground mb-md sm:mb-lg">
                        {isSignUp ? t('signup.title') : t('login.title')}
                    </h2>

                    {error && (
                        <div className="mb-md p-sm bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-xs">
                            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-body text-destructive">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-sm sm:space-y-md">
                        <div>
                            <label className="block text-body font-medium text-foreground mb-xs">
                                {t('login.email')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-sm py-sm sm:py-xs border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                placeholder={t('login.emailPlaceholder')}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-body font-medium text-foreground mb-xs">
                                {t('login.password')}
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-sm py-sm sm:py-xs border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-sm min-h-[44px] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-xs"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSignUp ? t('signup.submit') : t('login.submit')}
                        </button>
                    </form>

                    <div className="mt-lg text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-body text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                        >
                            {isSignUp ? t('signup.hasAccount') : t('login.noAccount')}
                        </button>
                    </div>
                </div>

                <p className="text-center text-caption text-muted-foreground mt-lg">
                    {t('login.dataProtected')}
                </p>
            </div>
        </div>
    );
};

export default Login;
