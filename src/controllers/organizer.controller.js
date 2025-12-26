const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// Organizer register Attender
exports.registerAttender = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (name,email,password,role,organizer_id) VALUES ($1,$2,$3,'attender',$4)",
      [name, email, hashedPassword, req.user.id]
    );

    res.json({ message: "Attender registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Organizer post Event
exports.createEvent = async (req, res) => {
  try {
    const { title, description } = req.body;

    await pool.query(
      "INSERT INTO events (title,description,organizer_id) VALUES ($1,$2,$3)",
      [title, description, req.user.id]
    );

    res.json({ message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
