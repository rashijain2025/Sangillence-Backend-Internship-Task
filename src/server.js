require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
