const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all players with optional filters
router.get('/', async (req, res) => {
  const { role, country, base_price, is_uncapped } = req.query;
  
  const where = {};
  if (role) where.role = role;
  if (country) where.country = country;
  if (base_price) where.base_price = parseFloat(base_price);
  if (is_uncapped === 'true') where.is_uncapped = true;
  if (is_uncapped === 'false') where.is_uncapped = false;

  try {
    const players = await prisma.player.findMany({ where });
    res.json(players);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// Get player by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await prisma.player.findUnique({ where: { id: req.params.id } });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch player' });
  }
});

module.exports = router;
