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
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const ws_1 = require("ws");
const GameManager_1 = require("./GameManager");
const url_1 = __importDefault(require("url"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 3000;
app_1.default.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
const wss = new ws_1.WebSocketServer({ port: 8080 });
const gameManager = new GameManager_1.GameManager();
wss.on('connection', function connection(ws, req) {
    return __awaiter(this, void 0, void 0, function* () {
        let userMeta = undefined;
        try {
            const parsedUrl = url_1.default.parse(req.url || '', true);
            const token = parsedUrl.query.token;
            if (token) {
                // Decode and verify the JWT signature using the environment secret key.
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                const user = yield prisma.user.findUnique({ where: { id: decoded.userId } });
                if (user) {
                    userMeta = {
                        userId: user.id,
                        email: user.Email,
                    };
                }
            }
        }
        catch (err) {
            // Force close connections that supply malformed or expired credentials
            ws.close(4001, 'Unauthorized: Invalid or expired token');
            return;
        }
        gameManager.addUser(ws, userMeta);
    });
});
