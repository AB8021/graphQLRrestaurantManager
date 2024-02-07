const bcrypt = require('bcryptjs');
const User = require('../models/user');
const createToken = require('../createtoken');

//Rest-api käyttäjän rekisteröinti ja autentikointi GraphQL-apia varten
const userResolvers = {
  registerUser: async ({ username, password, isadmin }) => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({
      username,
      password: hashedPassword,
      isadmin,
    });

    const token = createToken(user);
    return {
      success: true,
      message: 'token created',
      token: token,
    };
  },

  authenticateUser: async ({ username, password }) => {
    const user = await User.findOne({ username });

    if (!user) {
      return {
        success: false,
        message: 'no user found',
      };
    } else if (bcrypt.compareSync(password, user.password) === false) {
      return {
        success: false,
        message: 'wrong password',
      };
    } else {
      const token = createToken(user);
      return {
        success: true,
        message: 'token created',
        token: token,
      };
    }
  },
};

module.exports = userResolvers;
