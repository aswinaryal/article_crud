const express = require("express");
const { signup, login } = require("../controllers/authController");
const router = express.Router();

const {
  createUserTable,
  deleteUserTable,
  getUsers
} = require("../controllers/userController");

router.get("/create-user-table", createUserTable);
router.delete("/delete-user-table", deleteUserTable);

router.get("/", getUsers);

router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
