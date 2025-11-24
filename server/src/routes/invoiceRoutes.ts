import express from 'express';
import { getInvoices, getInvoice, createInvoice, updateInvoice, getInvoiceYears, getNextInvoiceNumber } from '../controllers/invoiceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getInvoices);
router.get('/years', getInvoiceYears);
router.get('/next-number', getNextInvoiceNumber);
router.get('/:id', getInvoice);
router.post('/', createInvoice);
router.put('/:id', updateInvoice);

export default router;
