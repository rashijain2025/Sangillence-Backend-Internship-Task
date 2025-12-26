const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const { initializeDatabase } = require('../config/db');

const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/login", adminController.loginAdmin);

router.post('/setup-db', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ success: true, message: 'Database initialized successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/register", auth, role("admin"), adminController.registerUser);

module.exports = router;
