import { Request, Response } from 'express';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/authMiddleware';

export const getCustomers = async (req: AuthRequest, res: Response) => {
    try {
        // All users can see all customers
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(customers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, address, ico, dic } = req.body;

        const customer = await prisma.customer.create({
            data: {
                name,
                email,
                address,
                ico,
                dic,
            },
        });

        res.status(201).json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, address, ico, dic } = req.body;

        const customer = await prisma.customer.update({
            where: { id },
            data: {
                name,
                email,
                address,
                ico,
                dic,
            },
        });

        res.json(customer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.customer.delete({ where: { id } });
        res.json({ message: 'Customer deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
