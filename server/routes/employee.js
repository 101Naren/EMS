const express = require('express');
const router = express.Router();
const { addEmployee, getEmployees, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../middleware/auth');

router.get('/', auth(['admin', 'employee', 'manager']), getEmployees);
router.post('/', auth(['admin']), addEmployee);
router.put('/:id', auth(['admin']), updateEmployee);
router.delete('/:id', auth(['admin']), deleteEmployee);

module.exports = router;