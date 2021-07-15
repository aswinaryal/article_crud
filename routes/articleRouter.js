const express = require("express");
const { createArticleTable } = require("../controllers/articleController");
const router = express.Router();

router.get("/create-article-table", createArticleTable);

module.exports = router;
