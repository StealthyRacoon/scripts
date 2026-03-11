const express = require("express");
const router = express.Router();
const controller = require("../controllers/permissionsController");

router.get("/permissions", controller.getPermissions);

module.exports = router;