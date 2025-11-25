import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { InvoiceEditor } from './pages/InvoiceEditor';
import { Customers } from './pages/Customers';

import { Invoices } from './pages/Invoices';
import { UserList } from './pages/UserList';
import { UserEditor } from './pages/UserEditor';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Invoices />
                        </ProtectedRoute>
                    } />
                    <Route path="/invoices/new" element={
                        <ProtectedRoute>
                            <InvoiceEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="/invoices" element={
                        <ProtectedRoute>
                            <Invoices />
                        </ProtectedRoute>
                    } />
                    <Route path="/customers" element={
                        <ProtectedRoute>
                            <Customers />
                        </ProtectedRoute>
                    } />
                    <Route path="/invoices/edit/:id" element={
                        <ProtectedRoute>
                            <InvoiceEditor />
                        </ProtectedRoute>
                    } />

                    <Route path="/users" element={
                        <ProtectedRoute>
                            <UserList />
                        </ProtectedRoute>
                    } />
                    <Route path="/users/new" element={
                        <ProtectedRoute>
                            <UserEditor />
                        </ProtectedRoute>
                    } />
                    <Route path="/users/edit/:id" element={
                        <ProtectedRoute>
                            <UserEditor />
                        </ProtectedRoute>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
