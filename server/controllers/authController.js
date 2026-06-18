const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND status = "active"', [email]
    );
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = rows[0];

    if (role === 'Admin' && user.role !== 'admin')
      return res.status(403).json({ message: 'Not an admin account' });

    if (role === 'Employee' && user.role === 'admin')
      return res.status(403).json({ message: 'Use the admin portal' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        password_changed: user.password_changed
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      'UPDATE users SET password = ?, password_changed = TRUE WHERE id = ?',
      [hash, decoded.id]
    );
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};