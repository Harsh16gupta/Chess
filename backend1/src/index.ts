import dotenv from 'dotenv';
import app from './app';
import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import url from 'url';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ port: 8080 });
const gameManager = new GameManager();

wss.on('connection', async function connection(ws, req) {
  let userMeta: { userId: number; email: string } | undefined = undefined;

  try {
    const parsedUrl = url.parse(req.url || '', true);
    const token = parsedUrl.query.token as string;

    if (token) {
      // Decode and verify the JWT signature using the environment secret key.
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        userMeta = {
          userId: user.id,
          email: user.Email,
        };
      }
    }
  } catch (err) {
    // Force close connections that supply malformed or expired credentials
    ws.close(4001, 'Unauthorized: Invalid or expired token');
    return;
  }

  gameManager.addUser(ws, userMeta);
});
