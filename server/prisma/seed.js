const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  const existingPlayersCount = await prisma.player.count();
  if (existingPlayersCount > 0) {
    console.log(`Found ${existingPlayersCount} players in the database. Skipping seed to prevent duplicates.`);
    return;
  }

  // Read photos mapping from CSV
  const photoMap = {};
  const csvPath = path.join(__dirname, 'seed-data', 'photos.csv');
  
  await new Promise((resolve, reject) => {
    if (!fs.existsSync(csvPath)) {
      console.log('photos.csv not found, proceeding without it.');
      resolve();
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.photo_url) {
          photoMap[row.name.trim()] = row.photo_url.trim();
        }
      })
      .on('end', () => {
        resolve();
      })
      .on('error', reject);
  });

  // Read players from JSON
  const jsonPath = path.join(__dirname, 'seed-data', 'players.json');
  if (!fs.existsSync(jsonPath)) {
    console.log('players.json not found. Exiting.');
    return;
  }

  const playersData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const mappedPlayers = playersData.map((player) => ({
    name: player.name,
    role: player.role,
    country: player.country,
    ipl_franchise: player.ipl_franchise,
    base_price: player.base_price,
    batting_strength: player.batting_strength,
    bowling_strength: player.bowling_strength,
    is_overseas: player.is_overseas,
    is_uncapped: player.is_uncapped,
    photo_url: photoMap[player.name] || player.photo_url || null,
  }));

  console.log(`Inserting ${mappedPlayers.length} players...`);
  await prisma.player.createMany({
    data: mappedPlayers,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
