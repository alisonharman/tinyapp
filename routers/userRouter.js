const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const { getUserByEmail, generateRandomString, urlsForUser, allowedAccess } = require("../helpers");

const userRouter = (users, urlDatabase) => {

  router.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_login", templateVars);
  });

  router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body["password"];

    const user = getUserByEmail(email, users);

    if (!user) {
      return res.status(403).send("No user with that email");
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).send("Incorrect password.");
    }
    req.session.user_id = user.id;
    res.redirect("/urls");
  });

  router.get("/register", (req, res) => {
    const user = users[req.session["user_id"]];
    const templateVars = {
      user: user,
    };
    res.render("urls_register", templateVars);
  });

  router.post("/register", (req, res) => {
    const email = req.body["email"];
    const password = req.body["password"];
    if (!email || !password) {
      return res.status(400).send("No email or password");
    }
    const user = getUserByEmail(email, users);
    if (user) {
      return res
        .status(400)
        .send("Error: User with that email already exists!");
    }
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body["password"], 10);
    users[userID] = {
      id: userID,
      email: req.body["email"],
      password: hashedPassword,
    };
    req.session.user_id = userID;
    res.redirect("/urls");
  });

  

  router.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
  });

  router.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  });

  return router;
};

module.exports = userRouter;
