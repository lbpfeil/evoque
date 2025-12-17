import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
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
                setError('Verifique seu email para confirmar o cadastro!');
            } else {
                await signIn(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao autenticar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="w-full max-w-md p-8">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="p-2 bg-black text-white rounded-lg">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">EVOQUE</h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 p-8">
                    <h2 className="text-xl font-semibold text-zinc-900 mb-6">
                        {isSignUp ? 'Criar Conta' : 'Entrar'}
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                                Senha
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isSignUp ? 'Criar Conta' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError('');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar agora'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-xs text-zinc-500 mt-6">
                    Seus dados são protegidos e criptografados
                </p>
            </div>
        </div>
    );
};

export default Login;
