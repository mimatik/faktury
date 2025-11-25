import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Plus, Edit, Trash2, Search, Mail, AlertTriangle } from 'lucide-react';
import { Avatar, Button, Card, Input, Modal, IconButton } from '../components/ui';

interface User {
    id: string;
    email: string;
    companyName: string | null;
    ico: string | null;
    dic: string | null;
    address: string | null;
    phone: string | null;
    bankAccount: string | null;
    isVatPayer: boolean;
    createdAt: string;
    updatedAt: string;
}

interface DeleteResponse {
    message: string;
    deleted: boolean;
    soft: boolean;
    invoiceCount?: number;
}

export const UserList: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteInfo, setDeleteInfo] = useState<DeleteResponse | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.companyName?.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query) ||
                        user.ico?.toLowerCase().includes(query)
                )
            );
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get('/users');
            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Chyba při načítání uživatelů');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteModalOpen(true);
        setDeleteInfo(null);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            const response = await api.delete(`/users/${userToDelete.id}`);
            setDeleteInfo(response);

            // Refresh the user list
            await fetchUsers();

            // Close modal after a short delay to show the result
            setTimeout(() => {
                setDeleteModalOpen(false);
                setUserToDelete(null);
                setDeleteInfo(null);
            }, 2000);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Chyba při mazání uživatele');
        }
    };

    const thClasses = 'text-left py-3 px-4 text-xs uppercase font-semibold text-slate-700';

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-slate-500">Načítání...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Správa uživatelů</h1>
                    <p className="text-slate-500 mt-1">Přehled a správa všech uživatelů systému</p>
                </div>
                <Button
                    icon={Plus}
                    onClick={() => navigate('/users/new')}
                    className="shadow-lg shadow-primary-500/20"
                >
                    Nový uživatel
                </Button>
            </div>

            <Card variant="default" className="mb-6">
                <Input
                    icon={Search}
                    placeholder="Hledat podle názvu firmy, emailu nebo IČO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            <Card variant="table">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className={thClasses}>Uživatel</th>
                                <th className={thClasses}>Email</th>
                                <th className={thClasses}>IČO / DIČ</th>
                                <th className={thClasses}>Plátce DPH</th>
                                <th className={thClasses}>Vytvořeno</th>
                                <th className={`${thClasses} text-right pr-6`}>Akce</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">
                                        {searchQuery ? 'Žádní uživatelé nenalezeni' : 'Žádní uživatelé'}
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Avatar
                                                    name={user.companyName || '?'}
                                                    id={user.id}
                                                    size="sm"
                                                />
                                                <span className="text-sm font-[600]">
                                                    {user.companyName || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} className="text-slate-400" />
                                                <span className="text-slate-600 text-sm">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-sm">
                                                <div className="text-slate-900">{user.ico || '-'}</div>
                                                {user.dic && (
                                                    <div className="text-slate-500 text-xs">{user.dic}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span
                                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${user.isVatPayer
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {user.isVatPayer ? 'Ano' : 'Ne'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-slate-600">
                                            {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <IconButton
                                                    icon={Edit}
                                                    onClick={() => navigate(`/users/edit/${user.id}`)}
                                                    tooltip="Upravit"
                                                    variant="default"
                                                />
                                                <IconButton
                                                    icon={Trash2}
                                                    onClick={() => handleDeleteClick(user)}
                                                    tooltip="Smazat"
                                                    variant="danger"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deleteModalOpen && !!userToDelete}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setUserToDelete(null);
                    setDeleteInfo(null);
                }}
                title="Smazat uživatele"
                size="md"
                titleIcon={<AlertTriangle className="text-red-600" size={24} />}
            >
                {deleteInfo ? (
                    <div className="mb-6">
                        <div className={`p-4 rounded-lg ${deleteInfo.soft ? 'bg-yellow-50' : 'bg-green-50'}`}>
                            <p className="text-sm font-medium text-slate-900 mb-1">
                                {deleteInfo.message}
                            </p>
                            {deleteInfo.soft && deleteInfo.invoiceCount && (
                                <p className="text-xs text-slate-600">
                                    Uživatel má {deleteInfo.invoiceCount} faktur a byl pouze označen jako smazaný.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-slate-600 mb-2">
                            Opravdu chcete smazat uživatele <strong>{userToDelete?.companyName || userToDelete?.email}</strong>?
                        </p>
                        <p className="text-sm text-slate-500 mb-6">
                            Pokud má uživatel faktury, bude pouze označen jako smazaný. Jinak bude trvale odstraněn z databáze.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setDeleteModalOpen(false);
                                    setUserToDelete(null);
                                }}
                                className="flex-1"
                            >
                                Zrušit
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                Smazat
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};
