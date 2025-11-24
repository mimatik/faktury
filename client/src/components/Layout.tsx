import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users as UsersIcon, LogOut, Settings } from 'lucide-react';
import { Avatar } from './ui';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return <>{children}</>;

    const isActive = (path: string) => {
        const active = location.pathname === path;
        return active
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900';
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
                            <span className="font-bold text-xl">F</span>
                        </div>
                        Faktury
                    </h1>
                </div>

                <div className="px-4 mb-6">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace</p>
                    <nav className="space-y-1">
                        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/')}`}>
                            <LayoutDashboard size={20} className={location.pathname === '/' || location.pathname === '/invoices' ? 'text-primary-600' : 'text-slate-400'} />
                            Přehled faktur
                        </Link>
                        <Link to="/customers" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/customers')}`}>
                            <UsersIcon size={20} className={location.pathname === '/customers' ? 'text-primary-600' : 'text-slate-400'} />
                            Adresář
                        </Link>
                    </nav>
                </div>

                <div className="px-4 mb-6">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">System</p>
                    <nav className="space-y-1">
                        <Link to="/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/users')}`}>
                            <UsersIcon size={20} className={location.pathname === '/users' ? 'text-primary-600' : 'text-slate-400'} />
                            Správa uživatelů
                        </Link>
                        <Link to={`/users/edit/${user.id}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(`/users/edit/${user.id}`)}`}>
                            <Settings size={20} className={location.pathname === `/users/edit/${user.id}` ? 'text-primary-600' : 'text-slate-400'} />
                            Nastavení
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-4">
                        <Avatar
                            name={user.companyName || user.email || '?'}
                            id={user.id}
                            size="md"
                        />
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.companyName || 'Moje Firma'}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={18} />
                        Odhlásit se
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50/50">
                <div className="p-8 lg:p-12 container mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};
