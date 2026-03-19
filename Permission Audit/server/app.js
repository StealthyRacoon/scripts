const express = require("express");
const cors = require("cors");

const permissionsRoutes = require("./routes/permissionsRoutes");
const superOwnersRoutes = require("./routes/superOwnersRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use("/api", permissionsRoutes);
app.use("/api", superOwnersRoutes);


// app.use(express.static(path.join(__dirname, "dist")));
// app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "dist", "index.html"));
// });



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});