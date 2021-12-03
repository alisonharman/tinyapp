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

const urlsForUser = function (id) {
  let urls = {};
  if (!id) {
    return undefined;
  }
  for (const property in urlDatabase) {
    if (urlDatabase[property]["userID"] == id) {
      // this is the URL object for me!
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

  /*
  const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };
  */
  const urlDatabase = {
    b6UTxQ: { longURL: "https://www.tsn.ca", userID: "AAAAAA" },
    i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
    i3dslr: { longURL: "https://www.lighthouselabs.ca", userID: "aZe4lW" }
  }

  const users = {
    "AAAAAA": {
      id: "AAAAAA",
      email: "user@example.com",
      password: "123"
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

  app.get("/urls", (req, res) => {

    const user = users[req.cookies["user_id"]] || undefined;    

    const templateVars = {
      user: user,
      urls: urlsForUser(req.cookies["user_id"])
    }
    // should not display URLs unless the user is logged in
    if (!user) {
      return res.render('urls_main', templateVars);
    }

    res.render("urls_index", templateVars);
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
   
    const user = users[req.cookies["user_id"]]
    const shortURL = req.params.shortURL;

     // should not display the page unless the user is logged in
     if (!user) {
      return res.render('urls_main', templateVars);
    }

    // does this shortURL belong to the user?
    const urls = urlsForUser(req.cookies["user_id"]);

/*
    const allowed = shortURL => {
      for (const property in urls) {
        if (property === shortURL) {
          return true;
        }
      }
      return false;
    }
    */
    
    if (allowedAccess(req.cookies["user_id"], shortURL)) {
      const templateVars = {
        user: users[req.cookies["user_id"]],
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL]["longURL"]
      };
      return res.render("urls_show", templateVars);
    }

    res.send('You do not have permission to edit this short URL.')
    
  });

  app.post("/urls", (req, res) => {
    // only registered and logged in users can create new tiny URLs
    const longURL = req.body["longURL"]
    if (req.cookies["user_id"]) {
      // user is logged in
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = { longURL, userID: req.cookies["user_id"] };
      //res.redirect(`/urls/:${shortURL}`);
      console.log(urlDatabase);
      return res.redirect('urls')
    }
    res.redirect('/urls')
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



  app.get('/login', (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]]
    };
    res.render('urls_login', templateVars);
  })

  app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body["password"];

    console.log(email, password);

    const user = getUserByEmail(email);

    console.log(user);

    if (!user) {
      return res.status(403).send("No user with that email")
    }

    if (password !== user.password) {
      return res.status(403).send("Incorrect password.")
    }

    res.cookie('user_id', user.id);
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

    if (!email || !password) {
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
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    // need to deal with case with input shortURL params not valid
    res.redirect(longURL);
  });

  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });

  app.post("/urls/:shortURL", (req, res) => {
    
    const user = users[req.cookies["user_id"]]
    const shortURL = req.params.shortURL;

    const templateVars = {
      user: user,
      urls: urlsForUser(req.cookies["user_id"])
    }

     // should not display the page unless the user is logged in
     if (!user) {
      return res.render('urls_main', templateVars);
    }

    // does this shortURL belong to the user?
    if (allowedAccess(req.cookies["user_id"], shortURL)) {
      urlDatabase[req.params.shortURL]["longURL"] = req.body["longURL"]
      return res.redirect(`/urls/`);
    }

    console.log(urlDatabase);
    return res.status(400).send('did not have permission to post');
    
  });



  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });