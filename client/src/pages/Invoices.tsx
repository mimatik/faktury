import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Download, Pencil, Filter, DollarSign, Activity, FileText, Users as UsersIcon } from 'lucide-react';
import { Button, SearchBar, IconButton, Card, Avatar } from '../components/ui';

interface Invoice {
    id: string;
    number: number;
    issueDate: string;
    total: number;
    currency: string;
    customer: { name: string };
    items: InvoiceItem[];
    user?: { id: string; companyName: string; email: string };
}

interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
}

interface User {
    id: string;
    email: string;
    companyName: string;
}

export const Invoices: React.FC = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [availableYears, setAvailableYears] = useState<number[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(user?.id || ''); // Default to current user

    // Fetch users for filter
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.get('/auth/users');
                setUsers(data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    // Fetch available years
    useEffect(() => {
        const fetchYears = async () => {
            try {
                const years = await api.get('/invoices/years');
                setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);
            } catch (error) {
                console.error('Error fetching years:', error);
                setAvailableYears([new Date().getFullYear()]);
            }
        };
        fetchYears();
    }, []);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const params = new URLSearchParams();
                params.append('year', year.toString());
                if (selectedUserId) {
                    params.append('userId', selectedUserId);
                }
                const data = await api.get(`/invoices?${params.toString()}`);
                setInvoices(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchInvoices();
    }, [year, selectedUserId]);

    const filteredInvoices = invoices.filter(inv =>
        inv.number.toString().includes(searchTerm) ||
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate base amount and VAT for an invoice
    const calculateAmounts = (invoice: Invoice) => {
        const base = invoice.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
        }, 0);
        const vat = invoice.total - base;
        return { base, vat };
    };

    // Calculate stats based on filtered invoices
    const stats = filteredInvoices.reduce((acc, inv) => {
        const { base, vat } = calculateAmounts(inv);
        return {
            base: acc.base + base,
            vat: acc.vat + vat,
            count: acc.count + 1
        };
    }, { base: 0, vat: 0, count: 0 });

    const showOwnerColumn = selectedUserId === '';

    const thClasses = 'text-left py-3 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Přehled faktur</h1>
                    <p className="text-slate-500 mt-1">Správa vystavených faktur a přehled statistik</p>
                </div>
                <Link to="/invoices/new">
                    <Button icon={Plus} className="shadow-lg shadow-primary-500/20">
                        Nová faktura
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} className="text-primary-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Celkem bez DPH</p>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {stats.base.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">Za vybrané období</p>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Celkem DPH</p>
                        <h3 className="text-3xl font-bold text-slate-900">
                            {stats.vat.toLocaleString('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 })}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">Za vybrané období</p>
                    </div>
                </Card>

                <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={64} className="text-amber-600" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Počet faktur</p>
                        <h3 className="text-3xl font-bold text-slate-900">{stats.count}</h3>
                        <p className="text-sm text-slate-400 mt-2">Celkem vystaveno</p>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <SearchBar
                        placeholder="Hledat podle čísla nebo zákazníka..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        containerClassName="flex-1"
                    />
                    <div className="flex items-center gap-2">
                        <UsersIcon size={18} className="text-slate-400" />
                        <select
                            className="input min-w-[180px]"
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Všichni uživatelé</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.companyName || u.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-400" />
                        <select
                            className="input min-w-[120px]"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* Invoices List */}
            <Card variant="table">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className={thClasses}>Číslo faktury</th>
                                <th className={thClasses}>Zákazník</th>
                                {showOwnerColumn && (
                                    <th className={thClasses}>Vlastník</th>
                                )}
                                <th className={thClasses}>Datum vystavení</th>
                                <th className={`${thClasses} text-right`}>Částka</th>
                                <th className={`${thClasses} text-right`}>Akce</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={showOwnerColumn ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                                        <FileText size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="text-lg font-medium">Žádné faktury</p>
                                        <p className="text-sm mt-1">Začněte vytvořením nové faktury</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map((invoice) => {
                                    const { base, vat } = calculateAmounts(invoice);
                                    return (
                                        <tr key={invoice.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-slate-900">{invoice.number}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-700">{invoice.customer.name}</span>
                                            </td>
                                            {showOwnerColumn && (
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar
                                                            name={invoice.user?.companyName || invoice.user?.email || '?'}
                                                            id={invoice.user?.id}
                                                            size="sm"
                                                        />
                                                        <span className="text-sm text-slate-600">
                                                            {invoice.user?.companyName || invoice.user?.email || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-500">
                                                    {new Date(invoice.issueDate).toLocaleDateString('cs-CZ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-slate-900">
                                                    {base.toLocaleString('cs-CZ', { style: 'currency', currency: invoice.currency })}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    DPH: {vat.toLocaleString('cs-CZ', { style: 'currency', currency: invoice.currency })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/invoices/edit/${invoice.id}`}>
                                                        <IconButton
                                                            icon={Pencil}
                                                            tooltip="Upravit fakturu"
                                                            className=""
                                                        />
                                                    </Link>
                                                    <a
                                                        href={`${API_URL}/invoices/${invoice.id}/pdf?token=${localStorage.getItem('token')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <IconButton
                                                            icon={Download}
                                                            tooltip="Stáhnout PDF"
                                                            className=""
                                                        />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div >
    );
};
