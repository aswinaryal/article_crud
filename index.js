const express = require("express");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/api/v1/status", (req, res, next) => {
  res.status(200).json({
    statu: "OK"
  });
});

app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
