const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { verifyJWT } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate unique 6-char alphanumeric code
function generateRoomCode() {
  return 'NPL-' + Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Create Room (Auctioneer only)
router.post('/create', verifyJWT, async (req, res) => {
  const { name, is_public, purse_per_team, timer_seconds, team_assignment, max_teams, rtm_cards } = req.body;
  const auctioneer_id = req.user.userId;

  let code;
  let isUnique = false;
  let attempts = 0;
  
  while (!isUnique && attempts < 5) {
    code = generateRoomCode();
    const existing = await prisma.room.findUnique({ where: { code } });
    if (!existing) isUnique = true;
    attempts++;
  }

  if (!isUnique) return res.status(500).json({ error: 'Could not generate unique room code' });

  try {
    const room = await prisma.room.create({
      data: {
        code,
        name,
        is_public,
        purse_per_team,
        timer_seconds,
        team_assignment,
        max_teams,
        rtm_cards,
        auctioneer_id
      }
    });
    res.json({ room });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// List Public Rooms
router.get('/public', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      where: { is_public: true, status: { in: ['LOBBY', 'ACTIVE'] } },
      include: {
        _count: {
          select: { teams: true }
        }
      }
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public rooms' });
  }
});

// Get Room details
router.get('/:code', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({
      where: { code: req.params.code },
      include: {
        teams: {
          include: { members: true }
        }
      }
    });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Join Room (Assigns guest to team randomly mode or returns available teams for choice mode)
router.post('/:code/join', async (req, res) => {
    // This is handled partly via REST (for initial validation) and partly via Socket connection later
    const { code } = req.params;
    const { guestId, guestName } = req.body;

    try {
        const room = await prisma.room.findUnique({
            where: { code },
            include: { teams: { include: { members: true } } }
        });
        if (!room) return res.status(404).json({ error: 'Room not found' });

        res.json({ room });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join room' });
    }
});

module.exports = router;
