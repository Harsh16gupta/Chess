"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const client_1 = require("@prisma/client");
const user_schema_1 = require("../schemas/user.schema");
const hash_1 = require("../utils/hash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = user_schema_1.userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    }
    const { email, password, } = result.data;
    try {
        const existingUser = yield prisma.user.findUnique({ where: { Email: email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }
        const hashedPassword = yield (0, hash_1.hashPassword)(password);
        const newUser = yield prisma.user.create({
            data: {
                Email: email,
                Password: hashedPassword,
                Rating: 1200,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.signup = signup;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = user_schema_1.userSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ message: 'Validation failed' });
    }
    const { email, password } = result.data;
    try {
        const user = yield prisma.user.findUnique({ where: { Email: email } });
        if (!user || !(yield (0, hash_1.comparePassword)(password, user.Password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // ✅ Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.login = login;
