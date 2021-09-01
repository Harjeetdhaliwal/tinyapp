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

app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user: users[user], urls : urlDatabase };
  res.render('urls_index', templateVars);
});

//add shortURL and corresponding longURL to urlDatabase object and responds with redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user: users[user] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user: users[user], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.post('/login', (req, res) => {
  res.cookie('username',req.body.username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const user = req.cookies['user_id'];
  const templateVars = { user: users[user] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const { email, password } = req.body;
  const newUser = {
    userId,
    email,
    password
  };
  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect('/urls');
});

function generateRandomString() {
  return Math.random().toString(36).substring(2,7);
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});