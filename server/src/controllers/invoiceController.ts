import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';
import QRCode from 'qrcode';

// Helper to convert Czech bank account to IBAN format
// Format: CZ + 2 check digits + 4-digit bank code + 16-digit account number
const convertToIBAN = (accountNumber: string): string => {
    // If already in IBAN format, return as is
    if (accountNumber.startsWith('CZ') && accountNumber.length === 24) {
        return accountNumber;
    }

    // Parse Czech account format: [prefix-]account/bankCode
    const parts = accountNumber.split('/');
    if (parts.length !== 2) {
        // If no bank code, return as is (might already be IBAN)
        return accountNumber;
    }

    const bankCode = parts[1].padStart(4, '0');
    const accountParts = parts[0].split('-');

    let prefix = '0';
    let account = '0';

    if (accountParts.length === 2) {
        prefix = accountParts[0];
        account = accountParts[1];
    } else {
        account = accountParts[0];
    }

    // Pad to required lengths
    const paddedPrefix = prefix.padStart(6, '0');
    const paddedAccount = account.padStart(10, '0');
    const baseAccount = paddedPrefix + paddedAccount;

    // Calculate check digits using mod 97 algorithm
    // Convert CZ00 to numbers: C=12, Z=35, 00=00
    const bban = bankCode + baseAccount;
    const numericString = bban + '123500'; // CZ = 1235, 00 = 00

    // Calculate mod 97
    let remainder = 0;
    for (let i = 0; i < numericString.length; i++) {
        remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
    }

    const checkDigits = (98 - remainder).toString().padStart(2, '0');

    return `CZ${checkDigits}${bban}`;
};

// Helper to generate SPAYD string (Czech QR payment format)
// According to official specification: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
const generateSpaydString = (account: string, amount: number, currency: string, vs: string, message: string) => {
    // Convert to IBAN if needed
    const iban = convertToIBAN(account);

    // Format amount with exactly 2 decimal places and dot as separator
    const formattedAmount = amount.toFixed(2);

    // Build SPAYD string according to specification
    // Format: SPD*1.0*ACC:{IBAN}*AM:{amount}*CC:{currency}*MSG:{message}*X-VS:{variableSymbol}
    let spayd = `SPD*1.0*ACC:${iban}*AM:${formattedAmount}*CC:${currency}`;

    // Add optional fields
    if (message) {
        // Convert message to uppercase and replace special characters for better compatibility
        const sanitizedMessage = message.toUpperCase().replace(/[^A-Z0-9 $%*+\-.\/:]/g, '');
        spayd += `*MSG:${sanitizedMessage}`;
    }

    if (vs) {
        spayd += `*X-VS:${vs}`;
    }

    return spayd;
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
    try {
        const currentUserId = req.user?.userId;
        const { userId, year } = req.query;

        const targetUserId = userId as string;
        const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

        const startDate = new Date(targetYear, 0, 1);
        const endDate = new Date(targetYear + 1, 0, 1);

        // Build where clause - only filter by userId if provided
        const whereClause: any = {
            issueDate: {
                gte: startDate,
                lt: endDate,
            },
        };

        if (targetUserId) {
            whereClause.userId = targetUserId;
        }

        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
                customer: true,
                items: true,
                user: true, // Include user data for owner column
            },
            orderBy: [
                { issueDate: 'desc' },
                { number: 'desc' }
            ],
        });

        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: { customer: true, items: true, user: true },
        });

        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { customerId, number, issueDate, dueDate, taxableDate, items, currency, language, isVatReverseCharge } = req.body;

        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate total
        const total = items.reduce((acc: number, item: any) => {
            const itemTotal = item.quantity * item.unitPrice;
            return acc + itemTotal * (1 + item.vatRate / 100);
        }, 0);

        // Generate QR Code
        let qrCodeString = null;
        let qrCodeDataUrl = null;
        if (user.bankAccount) {
            qrCodeString = generateSpaydString(user.bankAccount, total, currency || 'CZK', number.toString(), `Faktura ${number}`);
            try {
                qrCodeDataUrl = await QRCode.toDataURL(qrCodeString, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            } catch (error) {
                console.error('QR Code generation error:', error);
            }
        }

        const invoice = await prisma.invoice.create({
            data: {
                userId,
                customerId,
                number: parseInt(number),
                issueDate: new Date(issueDate),
                dueDate: new Date(dueDate),
                taxableDate: new Date(taxableDate),
                total,
                currency,
                language,
                isVatReverseCharge,
                qrCodeString,
                qrCodeDataUrl,
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unitPrice),
                        vatRate: parseFloat(item.vatRate),
                    })),
                },
            },
            include: { items: true },
        });

        res.status(201).json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { customerId, number, issueDate, dueDate, taxableDate, items, currency, language, isVatReverseCharge } = req.body;

        // Verify ownership
        const existing = await prisma.invoice.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Calculate total
        const total = items.reduce((acc: number, item: any) => {
            const itemTotal = item.quantity * item.unitPrice;
            return acc + itemTotal * (1 + item.vatRate / 100);
        }, 0);

        // Generate QR Code
        let qrCodeString = null;
        let qrCodeDataUrl = null;
        if (user.bankAccount) {
            qrCodeString = generateSpaydString(user.bankAccount, total, currency || 'CZK', number.toString(), `Faktura ${number}`);
            try {
                qrCodeDataUrl = await QRCode.toDataURL(qrCodeString, {
                    width: 200,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                });
            } catch (error) {
                console.error('QR Code generation error:', error);
            }
        }

        // Delete existing items and create new ones
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                customerId,
                number: parseInt(number),
                issueDate: new Date(issueDate),
                dueDate: new Date(dueDate),
                taxableDate: new Date(taxableDate),
                total,
                currency,
                language,
                isVatReverseCharge,
                qrCodeString,
                qrCodeDataUrl,
                items: {
                    create: items.map((item: any) => ({
                        description: item.description,
                        quantity: parseFloat(item.quantity),
                        unitPrice: parseFloat(item.unitPrice),
                        vatRate: parseFloat(item.vatRate),
                    })),
                },
            },
            include: { items: true, customer: true },
        });

        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getInvoiceYears = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const invoices = await prisma.invoice.findMany({
            where: { userId },
            select: { issueDate: true },
        });

        const years = [...new Set(
            invoices.map(inv => new Date(inv.issueDate).getFullYear())
        )].sort((a, b) => b - a);

        res.json(years);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getNextInvoiceNumber = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { year } = req.query;
        const targetYear = year ? parseInt(year as string) : new Date().getFullYear();

        // Find last invoice for the year
        const startRange = parseInt(`${targetYear}000`);
        const endRange = parseInt(`${targetYear + 1}000`);

        const lastInvoice = await prisma.invoice.findFirst({
            where: {
                userId,
                number: {
                    gte: startRange,
                    lt: endRange
                }
            },
            orderBy: { number: 'desc' }
        });

        let nextNumber = 1;
        if (lastInvoice) {
            const lastNum = parseInt(lastInvoice.number.toString().slice(4));
            nextNumber = lastNum + 1;
        }

        const invoiceNumber = parseInt(`${targetYear}${nextNumber.toString().padStart(3, '0')}`);
        res.json({ number: invoiceNumber });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
export const deleteInvoice = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        // Verify ownership
        const existing = await prisma.invoice.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        // Delete invoice (items should be deleted via cascade, but we can be explicit if needed)
        // Assuming cascade delete is configured in schema, otherwise we'd need to delete items first
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
        await prisma.invoice.delete({ where: { id } });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
