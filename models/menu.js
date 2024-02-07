const mongoose = require('mongoose');

const menu = new mongoose.Schema({
  menuitem: { type: String, required: true, max: 20 },
  description: { type: String, required: false, max: 50 },
  price: { type: Number, required: true, min: 0, max: 100 },
});

module.exports = menu;
