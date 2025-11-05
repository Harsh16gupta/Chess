"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const errorhandler_1 = require("./middlewares/errorhandler"); // ✅ check filename case too!
const app = (0, express_1.default)();
// ✅ Use JSON parser first
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true, // if you're using cookies/auth headers
}));
// ✅ Then your routes
app.use('/api/auth', auth_route_1.default);
// ✅ Then your fallback route (optional)
app.get('/', (req, res) => res.send('Hello from Express + TypeScript'));
// ✅ Finally the error handler — always last!
app.use(errorhandler_1.errorHandler);
exports.default = app;
