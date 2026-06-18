const bcrypt = require('bcrypt');
const db = require('../config/db');

exports.getEmployees = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, employee_id, name, email, role, department, status, created_at FROM users WHERE role != "admin"'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addEmployee = async (req, res) => {
  const { name, email, password, role, department, status, salary, joinDate, phone, address, reportingManager } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ message: 'Email already exists' });

    const hash = await bcrypt.hash(password, 12);
    const employeeId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;

    await db.query(
      `INSERT INTO users (name, email, password, role, department, status, salary, join_date, phone, address, reporting_manager, employee_id, password_changed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [name, email, hash, role.toLowerCase(), department, status, salary, joinDate, phone, address, reportingManager, employeeId]
    );

    res.json({ message: 'Employee created successfully', employeeId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, department, role, status, salary, phone, address, reportingManager } = req.body;
  try {
    await db.query(
      `UPDATE users SET name=?, department=?, role=?, status=?, salary=?, phone=?, address=?, reporting_manager=? WHERE id=?`,
      [name, department, role.toLowerCase(), status, salary, phone, address, reportingManager, id]
    );
    res.json({ message: 'Employee updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};