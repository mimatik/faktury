import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, X, Building2, Mail, MapPin, Phone, CreditCard, User, Lock } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';

interface UserFormData {
    email: string;
    password: string;
    companyName: string;
    ico: string;
    dic: string;
    address: string;
    phone: string;
    bankAccount: string;
    isVatPayer: boolean;
}

export const UserEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user: currentUser, login } = useAuth();
    const isEditMode = !!id;
    const isEditingSelf = id === currentUser?.id;

    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        companyName: '',
        ico: '',
        dic: '',
        address: '',
        phone: '',
        bankAccount: '',
        isVatPayer: false,
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode && id) {
            fetchUser(id);
        }
    }, [id, isEditMode]);

    const fetchUser = async (userId: string) => {
        try {
            setInitialLoading(true);
            const data = await api.get(`/users/${userId}`);
            setFormData({
                email: data.email || '',
                password: '',
                companyName: data.companyName || '',
                ico: data.ico || '',
                dic: data.dic || '',
                address: data.address || '',
                phone: data.phone || '',
                bankAccount: data.bankAccount || '',
                isVatPayer: data.isVatPayer || false,
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            alert('Chyba při načítání uživatele');
            navigate('/users');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email) {
            alert('Email je povinný');
            return;
        }

        if (!isEditMode && !formData.password) {
            alert('Heslo je povinné pro nové uživatele');
            return;
        }

        try {
            setLoading(true);

            if (isEditMode && id) {
                // Update existing user
                const updatedUser = await api.put(`/users/${id}`, formData);

                // If editing self, update the auth context
                if (isEditingSelf) {
                    login(localStorage.getItem('token') || '', updatedUser);
                }

                alert('Uživatel úspěšně upraven');
            } else {
                // Create new user
                await api.post('/users', formData);
                alert('Uživatel úspěšně vytvořen');
            }

            navigate('/users');
        } catch (error: any) {
            console.error('Error saving user:', error);
            alert(error.response?.data?.message || 'Chyba při ukládání uživatele');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/users');
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">Načítání...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        {isEditMode ? 'Upravit uživatele' : 'Nový uživatel'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isEditMode
                            ? isEditingSelf
                                ? 'Upravte své firemní údaje a profil'
                                : 'Upravte údaje uživatele'
                            : 'Vytvořte nového uživatele systému'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="secondary" icon={X} onClick={handleCancel}>
                        Zrušit
                    </Button>
                    <Button
                        icon={Save}
                        onClick={handleSubmit}
                        disabled={loading}
                        className="shadow-lg shadow-primary-500/20"
                    >
                        {loading ? 'Ukládám...' : 'Uložit'}
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Company Info */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <Building2 className="text-primary-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Firemní údaje</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-6 mt-6">
                            <Input
                                label="Název firmy"
                                type="text"
                                icon={Building2}
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="IČO"
                                    type="text"
                                    value={formData.ico}
                                    onChange={(e) => setFormData({ ...formData, ico: e.target.value })}
                                />
                                <Input
                                    label="DIČ"
                                    type="text"
                                    value={formData.dic}
                                    onChange={(e) => setFormData({ ...formData, dic: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Sídlo firmy"
                                as="textarea"
                                icon={MapPin}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isVatPayer"
                                    checked={formData.isVatPayer}
                                    onChange={(e) => setFormData({ ...formData, isVatPayer: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="isVatPayer" className="text-sm font-medium text-slate-700">
                                    Plátce DPH
                                </label>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <CreditCard className="text-primary-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Bankovní spojení</h2>
                        </div>

                        <div className="mt-6">
                            <Input
                                label="Číslo účtu"
                                type="text"
                                className="font-mono"
                                placeholder="123456789/0100"
                                value={formData.bankAccount}
                                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 mt-1">Zadejte číslo účtu včetně kódu banky.</p>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Account Info */}
                <div className="space-y-8">
                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <User className="text-primary-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Přihlašovací údaje</h2>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div>
                                <Input
                                    label="Email"
                                    type="email"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Email slouží jako přihlašovací jméno.
                                </p>
                            </div>

                            <div>
                                <Input
                                    label={isEditMode ? 'Nové heslo (volitelné)' : 'Heslo'}
                                    type="password"
                                    icon={Lock}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!isEditMode}
                                />
                                {isEditMode && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Ponechte prázdné pro zachování stávajícího hesla.
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <Phone className="text-primary-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Kontakt</h2>
                        </div>

                        <div className="mt-6">
                            <Input
                                label="Telefon"
                                type="tel"
                                icon={Phone}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
};
