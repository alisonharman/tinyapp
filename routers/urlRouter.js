const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const { generateRandomString, urlsForUser, allowedAccess } = require("../helpers");

const urlRouter = (users, urlDatabase) => {

  router.get("/", (req, res) => {
    const user = users[req.session.user_id];

    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id, urlDatabase),
    };
    // should not display URLs unless the user is logged in
    if (!user) {
      return res.render("urls_main", templateVars);
      //return res.redirect('/urls/new');
    }
    res.render("urls_index", templateVars);
  });


  router.post("/", (req, res) => {
    // only registered and logged in users can create new tiny URLs
    const longURL = req.body["longURL"];
    if (req.session.user_id) {
      // user is logged in
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = { longURL, userID: req.session["user_id"] };
      return res.redirect(`/urls/${shortURL}`);
      //return res.redirect('/urls:shortURL');
    }
    res.redirect(`/urls/`);
  });

  router.get("/new", (req, res) => {
    const user = users[req.session.user_id];
    const templateVars = {
      user,
    };
    // should redirect to login if user not logged in
    if (!user) {
      return res.redirect("/login");
    }
    res.render("urls_new", templateVars);
  });

  router.get("/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;

    // should not display the page unless the user is logged in
    if (!user) {
      return res.render("urls_main", { user: undefined });
    }

    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL, urlDatabase)) {
      const templateVars = {
        user: users[req.session.user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"],
      };
      return res.render("urls_show", templateVars);
    }
    res.send("You do not have permission to edit this short URL.");
  });

  //app.post("/urls/:shortURL", (req, res) => {
  router.put("/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;
    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id, urlDatabase),
    };
    // should not display the page unless the user is logged in
    if (!user) {
      return res.render("urls_main", templateVars);
    }
    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL, urlDatabase)) {
      urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"];
      return res.redirect(`/urls/`);
    }
    return res.status(400).send("did not have permission to post");
  });

  //app.post("/urls/:shortURL/delete", (req, res) => {
  router.delete("/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;

    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id),
    };
    // should not display the page unless the user is logged in
    if (!user) {
      return res.render("urls_main", templateVars);
    }
    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL, urlDatabase)) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    }
    return res.status(400).send("User did not have permission to delete URL");
  });


  return router
  
};

module.exports = urlRouter;