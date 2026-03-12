const express = require("express");
const router = express.Router();
const controller = require("../controllers/permissionsController");

router.get("/permissions", controller.getPermissions);
router.get("/users", controller.getAllUsers);

module.exports = router;