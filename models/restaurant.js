const mongoose = require('mongoose');
const menuSchema = require('./menu');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, max: 10 },
  address: { type: String, required: true, max: 10 },
  rating: { type: Number, required: true, min: 1, max: 10 },
  menu: { type: [menuSchema], required: true },
});

const restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = restaurant;
