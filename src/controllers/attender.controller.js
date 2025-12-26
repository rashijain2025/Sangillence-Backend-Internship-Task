const pool = require("../config/db");

exports.getEvents = async (req, res) => {
  try {
    const events = await pool.query(
      "SELECT * FROM events WHERE organizer_id=$1",
      [req.user.organizer_id]
    );

    res.json(events.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
