const getUserByEmail = (email, users) => {
  const userId = Object.keys(users).find(id => users[id].email === email)
  if (!userId) return undefined
  const user = users[userId]
  return { id: userId, ...user }
}

const generateRandomString = function() {
  const result = Math.random().toString(36).substring(2, 8);
  return result;
};

const urlsForUser = function (id, urlDatabase) {
  let urls = {};
  if (!id) {
    return undefined;
  }
  for (const property in urlDatabase) {
    if (urlDatabase[property]["userID"] === id) {
      urls[property] = urlDatabase[property];
    }
  }
  return urls;
};

const allowedAccess = function (id, shortURL, urlDatabase) {
  const urls = urlsForUser(id, urlDatabase);
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


module.exports = { getUserByEmail, generateRandomString, urlsForUser, allowedAccess };
