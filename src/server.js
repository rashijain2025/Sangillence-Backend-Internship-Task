require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require('./config/db');


const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/admin", require("./routes/admin.routes"));
app.use("/organizer", require("./routes/organizer.routes"));
app.use("/attender", require("./routes/attender.routes"));

app.get("/", (req, res) => {
  res.send("Sangillence Backend Running ");
});

const PORT = process.env.PORT || 10000;
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase();
    
    // Then start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
