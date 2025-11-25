import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Users, MapPin, Building2, Pencil } from 'lucide-react';
import { Button, SearchBar, Modal, Input, Card } from '../components/ui';

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
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        ico: '',
        dic: '',
        address: ''
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                // Update existing customer
                await api.put(`/customers/${editingCustomer.id}`, newCustomer);
            } else {
                // Create new customer
                await api.post('/customers', newCustomer);
            }
            setIsModalOpen(false);
            setEditingCustomer(null);
            setNewCustomer({ name: '', ico: '', dic: '', address: '' });
            fetchCustomers();
        } catch (error) {
            console.error(error);
            alert('Chyba při ukládání zákazníka');
        }
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setNewCustomer({
            name: customer.name,
            ico: customer.ico,
            dic: customer.dic || '',
            address: customer.address
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
        setNewCustomer({ name: '', ico: '', dic: '', address: '' });
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

                            <button
                                onClick={() => handleEdit(customer)}
                                className="mt-4 w-full btn btn-secondary text-sm py-2 gap-2 transition-opacity"
                            >
                                <Pencil size={16} />
                                Upravit
                            </button>
                        </Card>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingCustomer ? 'Upravit odběratele' : 'Nový odběratel'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Název firmy / Jméno"
                        type="text"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        required
                        autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="IČO"
                            type="text"
                            value={newCustomer.ico}
                            onChange={(e) => setNewCustomer({ ...newCustomer, ico: e.target.value })}
                            required
                        />
                        <Input
                            label="DIČ (volitelné)"
                            type="text"
                            value={newCustomer.dic}
                            onChange={(e) => setNewCustomer({ ...newCustomer, dic: e.target.value })}
                        />
                    </div>

                    <Input
                        label="Adresa"
                        as="textarea"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        required
                    />

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>
                            Zrušit
                        </Button>
                        <Button type="submit" variant="primary">
                            {editingCustomer ? 'Uložit změny' : 'Uložit'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
