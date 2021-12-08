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



module.exports = { getUserByEmail, generateRandomString };
