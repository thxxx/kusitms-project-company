// index.js
var express = require("express");
var app = express();

app.get("/", (req, res) => {
  res.send("this is node.js server. port number is 5000.");
  // res.sendFile( html file path );
});

app.listen(5000, () => {
  console.log("node.js server is connected. port number is 5000.");
});
