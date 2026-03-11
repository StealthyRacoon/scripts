const express = require("express");
const router = express.Router();
const controller = require("../controllers/superOwnersController");

router.get("/superownerspermissions", controller.getSuperOwnersPermissions);
router.get("/sites", controller.getSites);
router.get("/changesecrets", controller.changeSecrets);

module.exports = router;