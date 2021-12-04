const express = require("express");
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(cookieSession({ name: 'session', secret: 'purple-dinosaur' }))


app.set("view engine", "ejs");

const password = "123"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
bcrypt.compareSync("pink-donkey-minotaur", hashedPassword); // returns false

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 8);
  return result;
}

const getUserByEmail = email => {
  const userId = Object.keys(users).find(id => users[id].email === email)
  if (!userId) return null
  const user = users[userId]
  return { id: userId, ...user }
}

const urlsForUser = function (id) {
  let urls = {};
  if (!id) {
    return undefined;
  }
  for (const property in urlDatabase) {
    if (urlDatabase[property]["userID"] == id) {
      urls[property] = urlDatabase[property];
    }
  }
  return urls;
};

const allowedAccess = function (id, shortURL) {
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

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "AAAAAA" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3dslr: { longURL: "https://www.lighthouselabs.ca", userID: "aZe4lW" }
}

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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {

  const user = users[req.session.user_id];

  const templateVars = {
    user: user,
    urls: urlsForUser(req.session.user_id)
  }
  // should not display URLs unless the user is logged in
  if (!user) {
    return res.render('urls_main', templateVars);
  }

  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // only registered and logged in users can create new tiny URLs
  const longURL = req.body["longURL"]
  if (req.session.user_id) {
    // user is logged in
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL, userID: req.session["user_id"] };
    //res.redirect(`/urls/:${shortURL}`);
    return res.redirect('urls')
  }
  res.redirect('/urls')
});



app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.session["user_id"]]
  };
  res.render('urls_login', templateVars);
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body["password"];

  const user = getUserByEmail(email);

  if (!user) {
    return res.status(403).send("No user with that email")
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.")
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const user = users[req.session["user_id"]]
  
  const templateVars = {
    user: user
  }
  res.render("urls_register", templateVars);
})

app.post('/register', (req, res) => {

  const email = req.body["email"];
  const password = req.body["password"];

  if (!email || !password) {
    return res.status(400).send("No email or password")
  }

  const user = getUserByEmail(email);

  if (user) {
    return res.status(400).send("Error: User with that email already exists!")
  }

  const userID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body["password"], 10);
  users[userID] = { id: userID, email: req.body["email"], password: hashedPassword }
  req.session.user_id = userID;
  res.redirect('/urls')
})


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});



app.get('/logout', (req, res) => {
  //res.clearCookie('user_id').redirect('/urls')
  req.session = null;
  res.redirect('/urls');
})


app.get("/urls/:shortURL", (req, res) => {

  const user = users[req.session.user_id]
  const shortURL = req.params.shortURL;

  // should not display the page unless the user is logged in
  if (!user) {
    return res.render('urls_main', {user: undefined} );
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

  res.send('You do not have permission to edit this short URL.')

});

app.post("/urls/:shortURL", (req, res) => {

  const user = users[req.session.user_id]
  const shortURL = req.params.shortURL;

  const templateVars = {
    user: user,
    urls: urlsForUser(req.session.user_id)
  }

  // should not display the page unless the user is logged in
  if (!user) {
    return res.render('urls_main', templateVars);
  }

  // does this shortURL belong to the user?
  if (allowedAccess(req.session.user_id, shortURL)) {
    urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"]
    return res.redirect(`/urls/`);
  }

  return res.status(400).send('did not have permission to post');

});



app.post("/urls/:shortURL/delete", (req, res) => {

  const user = users[req.session.user_id]
  const shortURL = req.params.shortURL;

  const templateVars = {
    user: user,
    urls: urlsForUser(req.session.user_id)
  }

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
})



app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  // need to deal with case with input shortURL params not valid
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});