import express from 'express';
import { downloadInvoicePdf } from '../controllers/invoicePdfController';
import { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getInvoiceYears, getNextInvoiceNumber, updateInvoicePaymentStatus } from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvoices);
router.get('/years', getInvoiceYears);
router.get('/next-number', getNextInvoiceNumber);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.get('/:id/pdf', downloadInvoicePdf);
router.patch('/:id/payment-status', updateInvoicePaymentStatus);
router.put('/:id', updateInvoice);
router.delete('/:id', deleteInvoice);

export default router;
