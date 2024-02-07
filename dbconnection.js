const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
require('dotenv').config(); //dotenv -moduuli tarvitaan jos aiotaan käyttää .env -filua

// yhteydenotto Docker-kontissa sijaitsevaan kantaan, MONGODB_URL on .env tiedostossa:
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, // optioita eli konffimäärityksiä
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((err) => {
    console.error('Database connection error: ' + err);
  });
