import { z } from 'zod';

export const registerSchema = z.object({
    email: z.string().min(1, { message: "Email je povinný" }).email({ message: "Nesplňuje formát e-mailu" }),
    password: z.string().min(6, { message: "Heslo musí obsahovat minimálně 6 znaků" }),
    companyName: z.string().min(1, { message: "Název společnosti je povinný" }),
    ico: z.string().optional(),
    dic: z.string().optional(),
    address: z.string().optional(),
    bankAccount: z.string().optional(),
    isVatPayer: z.boolean().optional(),
});

export const loginSchema = z.object({
    email: z.string().min(1, { message: "Email je povinný" }).email({ message: "Nesplňuje formát e-mailu" }),
    password: z.string().min(1, { message: "Heslo je povinné" }),
});
