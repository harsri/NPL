const jwt = require('jsonwebtoken');

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'auctioneer') {
      return res.status(403).json({ error: 'Only auctioneers can access this' });
    }
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function verifyGuestToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No guest token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'manager') {
      return res.status(403).json({ error: 'Only team managers can access this' });
    }
    req.guest = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired guest token' });
  }
}

module.exports = { verifyJWT, verifyGuestToken };
