const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');


app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.urlencoded());

app.use(cors({origin: '*'}));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.use('/alias', require('./routes/alias'));

console.log("Server listening on port 3000");

app.listen(3000)

app.get("/test", function (req, res) {
  console.log("##########This is a test route")
  res.send(200, "<h1>HELLO</h1>");
});