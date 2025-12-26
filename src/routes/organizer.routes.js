const express = require("express");
const router = express.Router();

const organizerController = require("../controllers/organizer.controller");
const auth = require("../middlewares/auth.middleware");
const role = require("../middlewares/role.middleware");

router.post(
  "/register-attender",
  auth,
  role("organizer"),
  organizerController.registerAttender
);

router.post(
  "/event",
  auth,
  role("organizer"),
  organizerController.createEvent
);

module.exports = router;
