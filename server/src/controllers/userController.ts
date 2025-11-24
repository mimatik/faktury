import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prismaClient';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
            },
            select: {
                id: true,
                email: true,
                companyName: true,
                ico: true,
                dic: true,
                address: true,
                phone: true,
                bankAccount: true,
                isVatPayer: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { companyName: 'asc' },
        });

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                companyName: true,
                ico: true,
                dic: true,
                address: true,
                phone: true,
                bankAccount: true,
                isVatPayer: true,
                createdAt: true,
                updatedAt: true,
                deletedAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, companyName, ico, dic, address, phone, bankAccount, isVatPayer } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                companyName,
                ico,
                dic,
                address,
                phone,
                bankAccount,
                isVatPayer: isVatPayer || false,
            },
            select: {
                id: true,
                email: true,
                companyName: true,
                ico: true,
                dic: true,
                address: true,
                phone: true,
                bankAccount: true,
                isVatPayer: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, password, companyName, ico, dic, address, phone, bankAccount, isVatPayer } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== existingUser.email) {
            const emailTaken = await prisma.user.findUnique({ where: { email } });
            if (emailTaken) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData: any = {
            email,
            companyName,
            ico,
            dic,
            address,
            phone,
            bankAccount,
            isVatPayer,
        };

        // Only update password if provided
        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                companyName: true,
                ico: true,
                dic: true,
                address: true,
                phone: true,
                bankAccount: true,
                isVatPayer: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { invoices: true },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has invoices
        const hasInvoices = user._count.invoices > 0;

        if (hasInvoices) {
            // Soft delete - set deletedAt timestamp
            await prisma.user.update({
                where: { id },
                data: { deletedAt: new Date() },
            });

            res.json({
                message: 'Uživatel odstraněn (soft delete)',
                deleted: true,
                soft: true,
                invoiceCount: user._count.invoices
            });
        } else {
            // Hard delete - permanently remove from database
            await prisma.user.delete({
                where: { id },
            });

            res.json({
                message: 'Uživatel smazán natrvalo',
                deleted: true,
                soft: false
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
