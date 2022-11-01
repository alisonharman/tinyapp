const express = require("express");
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

const userRouter = require('./routers/userRouter')

const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "AAAAAA" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3dslr: { longURL: "https://www.lighthouselabs.ca", userID: "aZe4lW" }
};

const users = {
  "AAAAAA": {
    id: "AAAAAA",
    email: "user@example.com",
    password: "$2b$10$VDAhnmsXxYtY8ZF.l4fkQeFWg3ZWNNauWKruq17n7D6mRGTadkcc6"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "$2b$10$VDAhnmsXxYtY8ZF.l4fkQeFWg3ZWNNauWKruq17n7D6mRGTadkcc6"
  }
};

app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(cookieSession({ name: 'session', secret: 'purple-dinosaur' }));

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'))

app.set("view engine", "ejs");

app.use("/", userRouter(users, urlDatabase));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});