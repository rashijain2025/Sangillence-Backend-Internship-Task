const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post("/login", adminController.loginAdmin);
router.post("/register", auth, role("admin"), adminController.registerUser);

module.exports = router;
