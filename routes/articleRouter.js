const express = require("express");
const {
  createArticleTable,
  getArticles
} = require("../controllers/articleController");
const router = express.Router();

router.get("/create-article-table", createArticleTable);
router.get("/", getArticles);

module.exports = router;
