const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const hopitalRoutes = require("./routes/hopitalRoutes");
const rendezVousRoutes = require("./routes/rendezVousRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/staffRoutes");
const specialiteRoutes = require("./routes/specialiteRoutes");
const path = require("path");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/hopitaux", hopitalRoutes);
app.use("/api/rendez-vous", rendezVousRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/specialites", specialiteRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({ message: "API SAMA Health en ligne" });
});

module.exports = app;