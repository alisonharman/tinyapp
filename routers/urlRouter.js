const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");

const { getUserByEmail, generateRandomString, urlsForUser, allowedAccess } = require("../helpers");

const urlRouter = (users, urlDatabase) => {

  return router
  
};

module.exports = urlRouter;