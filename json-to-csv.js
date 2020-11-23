
const json = require("./to_train.json")

const fs = require("fs");

const headers = {
    email_from: "email_from",
    name_from: "name_from",
    subject: "subject",
    text: "text"
}

const { Parser } = require('json2csv');

const json2csvParser = new Parser({ delimiter: '|' });
const tsv = json2csvParser.parse(json);
 
fs.writeFileSync("works.csv", tsv);

