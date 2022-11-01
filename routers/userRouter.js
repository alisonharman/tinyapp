const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override')

const { getUserByEmail, generateRandomString } = require('../helpers');

const urlsForUser = function(id) {
  let urls = {};
  if (!id) {
    return undefined;
  }
  for (const property in urlDatabase) {
    if (urlDatabase[property]["userID"] === id) {
      urls[property] = urlDatabase[property];
    }
  }
  return urls;
};

const allowedAccess = function(id, shortURL) {
  const urls = urlsForUser(id);
  if (!id) {
    return false;
  }
  for (const property in urls) {
    if (property === shortURL) {
      return true;
    }
  }
  return false;
};


const userRouter = (users, urlDatabase) => {
  router.get("/urls", (req, res) => {
    const user = users[req.session.user_id];
  
    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id)
    };
    // should not display URLs unless the user is logged in
    if (!user) {
      return res.render('urls_main', templateVars);
      //return res.redirect('/urls/new');
    }
  
    res.render("urls_index", templateVars);
  });
  
  router.post("/urls", (req, res) => {
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
  
  
  router.get('/login', (req, res) => {
    const templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render('urls_login', templateVars);
  });
  
  router.post('/login', (req, res) => {
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
    res.redirect('/urls');
  });
  
  router.get('/register', (req, res) => {
    const user = users[req.session["user_id"]];
    const templateVars = {
      user: user
    };
    res.render("urls_register", templateVars);
  });
  
  router.post('/register', (req, res) => {
    const email = req.body["email"];
    const password = req.body["password"];
    if (!email || !password) {
      return res.status(400).send("No email or password");
    }
    const user = getUserByEmail(email, users);
    if (user) {
      return res.status(400).send("Error: User with that email already exists!");
    }
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body["password"], 10);
    users[userID] = { id: userID, email: req.body["email"], password: hashedPassword };
    req.session.user_id = userID;
    res.redirect('/urls');
  });
  
  router.get("/urls/new", (req, res) => {
    const user = users[req.session.user_id];
    const templateVars = {
      user
    };
    // should redirect to login if user not logged in
    if (!user) {
      return res.redirect('/login');
    }
    res.render("urls_new", templateVars);
  });
  
  router.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/urls');
  });
  
  router.get("/urls/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;
  
    // should not display the page unless the user is logged in
    if (!user) {
      return res.render('urls_main', { user: undefined });
    }
  
    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL)) {
      const templateVars = {
        user: users[req.session.user_id],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"]
      };
      return res.render("urls_show", templateVars);
    }
    res.send('You do not have permission to edit this short URL.');
  });
  
  //app.post("/urls/:shortURL", (req, res) => {
  router.put("/urls/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;
    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id)
    };
    // should not display the page unless the user is logged in
    if (!user) {
      return res.render('urls_main', templateVars);
    }
    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL)) {
      urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"];
      return res.redirect(`/urls/`);
    }
    return res.status(400).send('did not have permission to post');
  });
  
  //app.post("/urls/:shortURL/delete", (req, res) => {
  router.delete("/urls/:shortURL", (req, res) => {
    const user = users[req.session.user_id];
    const shortURL = req.params.shortURL;
  
    const templateVars = {
      user: user,
      urls: urlsForUser(req.session.user_id)
    };
    // should not display the page unless the user is logged in
    if (!user) {
      return res.render('urls_main', templateVars);
    }
    // does this shortURL belong to the user?
    if (allowedAccess(req.session.user_id, shortURL)) {
      delete urlDatabase[req.params.shortURL];
      res.redirect('/urls');
    }
    return res.status(400).send('User did not have permission to delete URL');
  });
  
  router.get("/u/:shortURL", (req, res) => {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  });

  return router;

};

module.exports = userRouter;