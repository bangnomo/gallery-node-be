//https://www.npmjs.com/package/datauri
const path = require("path");

const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

//Datauri settings
exports.formatBuffer = (file) =>
  parser.format(
    path.extname(file.originalname).toString().toLowerCase(),
    file.buffer
  );
