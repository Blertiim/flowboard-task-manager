const express = require("express");
const {
  createColumn,
  deleteColumn,
  listColumns,
  updateColumn
} = require("../controllers/columnController");

const router = express.Router();

router.get("/", listColumns);
router.post("/", createColumn);
router.patch("/:id", updateColumn);
router.delete("/:id", deleteColumn);

module.exports = router;
