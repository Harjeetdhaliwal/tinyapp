const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, urlsForUser } = require('./helpers');

const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080;

app.set('view engine', 'ejs');

const urlDatabase = {
  'b6UTxQ': {
    longURL: 'https://www.tsn.ca',
    userID: 'aJ48lW'
  }
};

const users = {
  'aJ48lW': {
    userID: 'aJ48lW',
    email: 'abc@d.com',
    password: 'test' //this password won't work cause I am saving password after hasing them at line 181. 
    //This is just to show the structure of the users object.
  }
};

app.get('/', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect('/login');
  }
  return res.redirect('/urls');
});


app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});


app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(400).send("Please login or Register!");
  }

  const userspecificURLDatabase = urlsForUser(userId, urlDatabase);
  const templateVars = { user: users[userId], urls : userspecificURLDatabase };
  res.render('urls_index', templateVars);
});

//add shortURL and corresponding longURL to urlDatabase object and responds with redirection to /urls/:shortURL
app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
   res.send("Please login first!");
  }
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID: userId};
  res.redirect(`/urls/${shortURL}`);
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.redirect('/login');
  } else {
    const templateVars = { user: users[userId] };
    res.render('urls_new', templateVars);
  }
});

// GET /urls/:id
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (!userId) {
    return res.send("Please login first!");
  }
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("Incorrect short URL!");
  } 
  if(urlDatabase[shortURL]['userID'] !== userId) {
    return res.send("This is not your url");
  }

  const templateVars = { user: users[userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: urlDatabase[req.params.shortURL].userId};
  res.render('urls_show', templateVars);
});


//POST /urls/:id
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(403).send("Please login first");
  } 
  if (urlDatabase[shortURL].userID !== userId) {
    return res.sendStatus(400).send("Unauthorized action! This is not your URL!");
  }
  const longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL
  //urlDatabase[shortURL].userID = req.session.user_id;
  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send("ShortURL does not exists!");
  } 
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  if (!userId ) {
    return res.status(403).send("Please login to delete the URL!")
  } 
  if (urlDatabase[shortURL].userID !== userId) {
    res.sendStatus(400);
    return res.send("Unauthorized action!! This URL is not created by you!");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Display the login form
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userId] }
  res.render('login', templateVars);
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const userId = getUserByEmail(email, users);

  if (userId && bcrypt.compareSync(password, userId.password)) {
    req.session.user_id = userId.userId;
    return res.redirect('/urls');
  } 

  if (!email || !password) {
    return res.send("Please enter both email and password!!")
  }

  res.send("Please enter correct email and password !");

});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//Display the register form
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[userId] }
  res.render('register', templateVars);
});


app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.send(res.send("Please enter both email and password!"));
  };

  const emailFound = getUserByEmail(email, users);
  if (emailFound) {
    return res.send(res.send("This email is already registered!"));
  }

  const userId = generateRandomString();
  const newUser = {
    userId,
    email,
    password: bcrypt.hashSync(password, 10)
  };

  users[userId] = newUser;
  req.session.user_id = userId;
  console.log(bcrypt.hashSync(password, 10));
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});