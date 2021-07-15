const express = require("express");
const router = express.Router();

const {
  createUserTable,
  deleteUserTable
} = require("../controllers/userController");

router.get("/create-user-table", createUserTable);
router.delete("/delete-user-table", deleteUserTable);

module.exports = router;
