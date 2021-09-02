const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b6UTxQ': {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW'
  },
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'aJ48lW'
  },
  '9sm5xK':{
    longURL: "https://www.google.ca",
    userID: 'aJ48lW'
  }
};

const users = {};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,7);
};

const emailLookup = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      return usersDatabase[userId];
    }
  }
  return false;
};

const urlsForUser = (id, database) => {
  const userspecificURLDatabase = {};

  for (let url in database) {
    if(database[url]['userID'] === id) {
     userspecificURLDatabase[url] = {};
     userspecificURLDatabase[url]['longURL'] = database[url]['longURL'];
     userspecificURLDatabase[url]['userID'] = database[url]['userID'] 
    }
  }

  return userspecificURLDatabase;
};


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  if (!userId) {
    res.status(400);
    res.send("Please login or register first");
  }

  const userspecificURLDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { user: users[userId], urls : userspecificURLDatabase };
  res.render('urls_index', templateVars);
});

//add shortURL and corresponding longURL to urlDatabase object and responds with redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  if (!userId) {
   res.send("Please login first!");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: userId};
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  if (!userId) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[userId] };
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  if (!userId) {
    res.send("Please login first!");
  }
  if(urlDatabase[shortURL]['userID'] !== userId) {
    res.send("This is not your url");
  }

  const templateVars = { user: users[userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: urlDatabase[req.params.shortURL].userId};
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const userId = req.cookies['user_id'];
  if(!userId || urlDatabase[shortURL].userID !== userId) {
    res.sendStatus(400);
    return res.send("Unauthorized action");
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL
  urlDatabase[shortURL].userID = req.cookies['user_id'];
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.sendStatus(400);
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies['user_id'];
  if(!userId || urlDatabase[shortURL].userID !== userId) {
    res.sendStatus(400);
    return res.send("Unauthorized action");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});



//Display the login form
app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { user: users[userId] }
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userId = emailLookup(email, users);

  if (userId && bcrypt.compareSync(password, userId.password)) {
    res.cookie("user_id", userId.userId);
    res.redirect('/urls');
  } else {
    res.sendStatus(403);
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

//Display the register form
app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { user: users[userId] }
  res.render('register', templateVars);
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send(res.sendStatus(400));
  };
  const emailFound = emailLookup(email, users);
  if (emailFound) {
    return res.send(res.sendStatus(400));
  }
  const userId = generateRandomString();
  const newUser = {
    userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});