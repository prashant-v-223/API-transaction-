const express = require("express");

const router = express.Router();

const register = require("./register");
const transactions = require("./transactions");

router.use("/registration", register);

router.use("/transactions", transactions);

module.exports = router;
