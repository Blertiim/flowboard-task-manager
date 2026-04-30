const express = require("express");
const { getBoard } = require("../controllers/boardController");

const router = express.Router();

router.get("/", getBoard);

module.exports = router;
