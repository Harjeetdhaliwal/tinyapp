const assert = require('chai').assert;
const { getUserByEmail } = require('../helpers');

const testUsers = {
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
};

describe('getUserByemail', () => {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = 'userRandomID';
    assert.equal(user.id, expectedOutput);
  });

  it('should return undefined if an email does not exists in users database', () => {
    const user = getUserByEmail("random@email.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user.id, expectedOutput);
  });
});