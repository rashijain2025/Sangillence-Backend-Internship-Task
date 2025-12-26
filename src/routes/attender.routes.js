const express = require("express");
const router = express.Router();

const attenderController = require("../controllers/attender.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.get(
  "/events",
  auth,
  role("attender"),
  attenderController.getEvents
);

module.exports = router;
