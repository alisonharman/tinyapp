const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

app.set("view engine", "ejs");

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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const shortID = generateRandomString();
  const templateVars = {
    user: users[req.cookies["user_id"]],
   // shortURL: shortID
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  //const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  //res.redirect(`/urls/:${shortURL}`);
  res.redirect('urls')
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
})



app.get('/logout', (_req, res) => {
  res.clearCookie('user_id').redirect('/urls')
})

/*
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
*/

app.get("/urls", (req, res) => {
  //console.log(req.cookies["user_id"]);
  //console.log(users[req.cookies["user_id"]])
  console.log(users);
  const user = users[req.cookies["user_id"]] //|| users["userRandomID"]
  //console.log(user);
  //const templateVars = {
  //  username: req.cookies["username"],
  //  urls: urlDatabase
  //};
  const templateVars = {
    user: user,
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]};
  res.render('urls_login', templateVars);
})

app.post('/login', (req, res) => {
  const username = req.body.username;
  //res.cookie('username', username);
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]]
  //const templateVars = {
  //  username: req.cookies["username"],
  //};
  const templateVars = {
    user: user
  }
  res.render("urls_register", templateVars);
})

app.post('/register', (req, res) => {


  const email = req.body["email"];
  const password = req.body["password"];

  if (!email || ! password) {
   return res.status(400).send("No email or password")
  }

  const user = getUserByEmail(email);

  if (user) {
    return res.status(400).send("Error: User with that email already exists!")
  }

  const userID = generateRandomString();
  users[userID] = { id: userID, email: req.body["email"], password: req.body["password"] }
  res.cookie('user_id', userID);
  res.redirect('/urls')
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // need to deal with case with input shortURL params not valid
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body["longURL"]
  res.redirect(`/urls/`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
