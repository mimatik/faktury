import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { api } from '../utils/api';
import { InvoicePDF } from '../components/InvoicePDF';
import { useAuth } from '../context/AuthContext';

export const InvoiceView: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [invoice, setInvoice] = useState<any>(null);

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const data = await api.get(`/invoices/${id}`);
                setInvoice(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchInvoice();
    }, [id]);

    if (!invoice || !user) return <div>Načítání...</div>;

    return (
        <div className="h-screen w-full">
            <PDFViewer width="100%" height="100%" className="border-none">
                <InvoicePDF invoice={invoice} user={user} />
            </PDFViewer>
        </div>
    );
};
