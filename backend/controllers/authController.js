const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'supersecretkey';

// In-memory user store for demo (replace with DB in production)
const users = [];

exports.register = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }
  if (!email.toLowerCase().endsWith('@gtu.edu.tr')) {
    return res.status(400).json({ error: 'Email must end with @gtu.edu.tr' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  const user = { email, name };
  users.push(user);
  // Issue JWT
  const token = jwt.sign({ email, name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
};

exports.login = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Issue JWT
  const token = jwt.sign({ email: user.email, name: user.name }, SECRET, { expiresIn: '7d' });
  res.json({ token, user });
};

exports.me = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    res.json({ user: decoded });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}; 