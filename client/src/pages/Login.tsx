import React, { useState } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import { Input, Button, Card } from '../components/ui';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setEmailError('');
        setPasswordError('');

        try {
            const data = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/');
        } catch (err: any) {
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors;
                if (errors.email?._errors?.[0]) setEmailError(errors.email._errors[0]);
                if (errors.password?._errors?.[0]) setPasswordError(errors.password._errors[0]);
            } else {
                setError(err.response?.data?.message || 'Chyba přihlášení');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary-500/30 mb-6">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Vítejte zpět</h1>
                    <p className="text-slate-500 mt-2">Přihlaste se do svého účtu</p>
                </div>

                <Card className="shadow-xl shadow-slate-200/50 border-0">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                icon={Mail}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="vas@email.cz"
                                error={emailError}
                            />

                            <Input
                                label="Heslo"
                                type="password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                error={passwordError}
                            />
                        </div>

                        <Button type="submit" variant="primary" className="w-full py-3 shadow-lg shadow-primary-500/20">
                            Přihlásit se
                        </Button>
                    </form>
                </Card>

                <p className="text-center text-slate-500">
                    Nemáte ještě účet?{' '}
                    <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                        Zaregistrujte se
                    </Link>
                </p>
            </div>
        </div>
    );
};
