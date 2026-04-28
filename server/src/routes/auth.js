const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'npl_super_secret_123';

// Register Auctioneer
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password_hash }
    });

    const token = jwt.sign({ userId: user.id, username: user.username, role: 'auctioneer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login Auctioneer
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, username: user.username, role: 'auctioneer' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Guest Token for Team Manager
router.post('/guest', (req, res) => {
  const { username, roomId } = req.body;
  if (!username || !roomId) return res.status(400).json({ error: 'Username and room code required' });
  
  // We don't save guests to DB, they just get a token scoped to the room
  const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
  const token = jwt.sign({ guestId, guestName: username, roomId, role: 'manager' }, JWT_SECRET, { expiresIn: '12h' });
  
  res.json({ token, guest: { guestId, guestName: username, roomId } });
});

module.exports = router;
