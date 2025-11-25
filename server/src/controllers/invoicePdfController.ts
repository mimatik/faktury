import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import { InvoicePDF } from '../templates/InvoicePDF';
import { AuthRequest } from '../middleware/authMiddleware';

export const downloadInvoicePdf = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { customer: true, items: true, user: true },
        });

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Check ownership
        if (invoice.userId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const pdfStream = await renderToStream(
            React.createElement(InvoicePDF, { invoice, user: invoice.user }) as any
        );

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="faktura-${invoice.number}.pdf"`);

        pdfStream.pipe(res);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: 'Failed to generate PDF' });
    }
};
