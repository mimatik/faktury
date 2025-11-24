import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Save, Building2, Mail, MapPin, FileText, User } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';

export const Settings: React.FC = () => {
    const { user, login } = useAuth();
    const [formData, setFormData] = useState({
        companyName: '',
        ico: '',
        dic: '',
        address: '',
        email: '',
        phone: '',
        bankAccount: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                companyName: user.companyName || '',
                ico: user.ico || '',
                dic: user.dic || '',
                address: user.address || '',
                email: user.email || '',
                phone: user.phone || '',
                bankAccount: user.bankAccount || ''
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedUser = await api.put('/auth/me', formData);
            login(localStorage.getItem('token') || '', updatedUser);
            alert('Nastavení uloženo');
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání nastavení');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nastavení</h1>
                    <p className="text-slate-500 mt-1">Správa firemních údajů a profilu</p>
                </div>
                <Button icon={Save} onClick={handleSubmit} className="shadow-lg shadow-primary-500/20">
                    Uložit změny
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <FileText className="text-primary-600" size={20} />
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

                {/* Right Column - Contact Info */}
                <div className="space-y-8">
                    <Card>
                        <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                            <User className="text-primary-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Kontaktní údaje</h2>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div>
                                <Input
                                    label="Email"
                                    type="email"
                                    icon={Mail}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled
                                />
                                <p className="text-xs text-slate-500 mt-1">Email slouží jako přihlašovací jméno a nelze jej změnit.</p>
                            </div>

                            <Input
                                label="Telefon"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
