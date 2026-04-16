const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 80;

app.use(cors());
app.use(express.json());

app.use("/api", require("./controllers/permissionsController"));
app.use("/api", require("./controllers/superOwnersController"));
app.use("/api", require("./controllers/auditController"));
app.use("/api", require("./controllers/campaignController"));
app.use("/api", require("./controllers/adminController"));
app.use("/api", require("./controllers/settingsController"));

app.use(express.static(path.join(__dirname, "dist")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// SPA fallback (FIXED)
app.get("/*rest", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
