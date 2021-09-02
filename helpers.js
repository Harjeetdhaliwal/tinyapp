const getUserByEmail = (email, usersDatabase) => {
  for (const userId in usersDatabase) {
    if (usersDatabase[userId].email === email) {
      return usersDatabase[userId];
    }
  }
  return false;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2,7);
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

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser
}