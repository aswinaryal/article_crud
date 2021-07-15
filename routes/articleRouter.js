const express = require("express");
const {
  createArticleTable,
  getArticles,
  createArticle,
  deleteArticleTable,
  updateArticleById
} = require("../controllers/articleController");
const { protect } = require("../controllers/authController");
const router = express.Router();

router.get("/create-articles-table", createArticleTable);
router.delete("/delete-articles-table", deleteArticleTable);

router.route("/").get(getArticles).post(protect, createArticle);

router.route("/:id").patch(protect, updateArticleById);

module.exports = router;
