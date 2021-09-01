const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
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


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { user: users[userId], urls : urlDatabase };
  res.render('urls_index', templateVars);
});

//add shortURL and corresponding longURL to urlDatabase object and responds with redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { user: users[userId] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = { user: users[userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
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
  console.log(userId.password);

  if (userId && userId.password === password) {
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
    password
  };
  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});