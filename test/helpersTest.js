const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

getUserByEmail("user@example.com", testUsers)

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.deepEqual(testUsers[expectedOutput], user);
  });

  it('should return undefined with non-existent email', function() {
    const user = getUserByEmail("nobody@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.strictEqual(undefined, user);
  });
});