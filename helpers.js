const getUserByEmail = (email, users) => {
  const userId = Object.keys(users).find(id => users[id].email === email)
  if (!userId) return null
  const user = users[userId]
  return { id: userId, ...user }
}

module.exports = getUserByEmail;