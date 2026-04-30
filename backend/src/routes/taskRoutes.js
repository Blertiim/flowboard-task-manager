const express = require("express");
const {
  createTask,
  deleteTask,
  listTasks,
  moveTask,
  updateTask
} = require("../controllers/taskController");

const router = express.Router();

router.get("/", listTasks);
router.post("/", createTask);
router.patch("/:id", updateTask);
router.patch("/:id/move", moveTask);
router.delete("/:id", deleteTask);

module.exports = router;
