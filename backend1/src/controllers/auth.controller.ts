import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { userSchema } from '../schemas/user.schema';
import { comparePassword, hashPassword } from '../utils/hash';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
export const signup = async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    }

    const { email, password, } = result.data;

    try {
        const existingUser = await prisma.user.findUnique({ where: { Email: email } });

        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                Email: email,
                Password: hashedPassword,
                Rating: 1200,
                
            },
        });

        const token = jwt.sign(
            { userId: newUser.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        const safeUser = {
            id: newUser.id,
            email: newUser.Email,
            rating: newUser.Rating
        };

        return res.status(201).json({
            message: "User created successfully",
            token,
            user: safeUser
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const login = async (req: Request, res: Response) => {
    const result = userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed' });
    }

    const { email, password } = result.data;

    try {
        const user = await prisma.user.findUnique({ where: { Email: email } });

        if (!user || !(await comparePassword(password, user.Password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // ✅ Generate JWT
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );



        // ✅ Send only safe user data
        const safeUser = {
            id: user.id,
            email: user.Email,
            rating: user.Rating || 1200, // default if null
            
        };

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: safeUser
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
