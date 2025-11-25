import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Users, MapPin, Building2, Pencil, Trash2 } from 'lucide-react';
import { Button, SearchBar, Modal, Card, IconButton } from '../components/ui';
import { CustomerForm } from '../components/CustomerForm';

interface Customer {
    id: string;
    name: string;
    ico: string;
    dic?: string;
    address: string;
}

export const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await api.get('/customers');
            setCustomers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        fetchCustomers();
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleDelete = async (customer: Customer) => {
        if (window.confirm(`Opravdu chcete smazat odběratele "${customer.name}"? Tato akce je nevratná.`)) {
            try {
                await api.delete(`/customers/${customer.id}`);
                fetchCustomers();
            } catch (error) {
                console.error(error);
                alert('Chyba při mazání odběratele');
            }
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ico.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Odběratelé</h1>
                    <p className="text-slate-500 mt-1">Správa vašich klientů a odběratelů</p>
                </div>
                <Button icon={Plus} onClick={() => setIsModalOpen(true)} className="shadow-lg shadow-primary-500/20">
                    Nový odběratel
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4">
                <SearchBar
                    placeholder="Hledat podle jména nebo IČO..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    containerClassName="max-w-md"
                />
            </Card>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCustomers.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-slate-500 card bg-slate-50 border-dashed border-2 border-slate-200 shadow-none">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <Users size={24} />
                            </div>
                            <p>Nebyly nalezeni žádní odběratelé.</p>
                        </div>
                    </div>
                ) : (
                    filteredCustomers.map((customer) => (
                        <Card className="transition-all duration-300 group hover:shadow-lg" key={customer.id}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-bold text-lg">
                                    {customer.name[0]}
                                </div>
                                <div className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">
                                    IČO: {customer.ico}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary-600 transition-colors">
                                {customer.name}
                            </h3>

                            <div className="space-y-2 mt-4 text-sm text-slate-600">
                                <div className="flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 text-slate-400" />
                                    <span>{customer.address}</span>
                                </div>
                                {customer.dic && (
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-slate-400" />
                                        <span>DIČ: {customer.dic}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => handleEdit(customer)}
                                    className="flex-1 btn btn-secondary text-sm py-2 gap-2 transition-opacity"
                                >
                                    <Pencil size={16} />
                                    Upravit
                                </button>
                                <IconButton
                                    icon={Trash2}
                                    onClick={() => handleDelete(customer)}
                                    tooltip="Smazat odběratele"
                                    variant="danger"
                                />
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCancel}
                title={editingCustomer ? 'Upravit odběratele' : 'Nový odběratel'}
            >
                <CustomerForm
                    customer={editingCustomer || undefined}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    );
};
