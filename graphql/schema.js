const { composeWithMongoose } = require('graphql-compose-mongoose');
const { schemaComposer } = require('graphql-compose');
const { GraphQLJSON } = require('graphql-type-json');
//haetaan restaurant-model tähän
const Restaurant = require('../models/restaurant');
const customizationOptions = {};
const RestaurantTC = composeWithMongoose(Restaurant, customizationOptions);
const userResolvers = require('./userResolvers');
schemaComposer.add(GraphQLJSON);
//express-sovelluksen CRUD-toiminnot GraphQL-Apilla
//tähän saa yhteyden GraphiQL visuaalisuudella localhost:3000/ osoitteesta tai postmanilla
//käytössä GraphQL-compose-mongoose
//https://www.npmjs.com/package/graphql-compose-mongoose

//funktio uusien menutuotteiden lisäämiseen olemassaolevalle ravintolalle
const addMenuItem = {
  type: RestaurantTC,
  args: {
    name: 'String!',
    menuitem: 'String!',
    description: 'String!',
    price: 'Float!',
  },
  resolve: async (_, args) => {
    const { name, menuitem, description, price } = args;
    const restaurant = await Restaurant.findOne({ name });

    if (!restaurant) {
      throw new Error('restaurant not found');
    }

    restaurant.menu.push({ menuitem, description, price });
    return restaurant.save();
  },
};
//päivitetään menu-tuotetta
const updateMenuItem = {
  type: RestaurantTC,
  args: {
    name: 'String!',
    menuitem: 'String!',
    newPrice: 'Float!',
  },
  resolve: async (_, args) => {
    const { name, menuitem, newPrice } = args;
    const restaurant = await Restaurant.findOne({ name });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    const menuIndex = restaurant.menu.findIndex((menus) => menus.menuitem === menuitem);

    if (menuIndex === -1) {
      throw new Error('Price not found');
    }

    restaurant.menu[menuIndex].price = newPrice;
    return restaurant.save();
  },
};
// poistetaan ravintolasta menu-tuote
const removeMenuItem = {
  type: RestaurantTC,
  args: {
    name: 'String!',
    menuitem: 'String!',
  },
  resolve: async (_, args) => {
    const { name, menuitem } = args;
    const restaurant = await Restaurant.findOne({ name });

    if (!restaurant) {
      throw new Error('restaurant not found');
    }

    const menuIndex = restaurant.menu.findIndex((menus) => menus.menuitem === menuitem);

    if (menuIndex === -1) {
      throw new Error('no menu item found');
    }

    restaurant.menu.splice(menuIndex, 1);
    return restaurant.save();
  },
};
//käsitellään autentikaatiovastaus
const AuthResponseTC = schemaComposer.createObjectTC({
  name: 'AuthResponse',
  fields: {
    success: 'Boolean',
    message: 'String',
    token: 'String',
  },
});

//queryt ovat haku-ominaisuuksia. Niistä saadaan tietoa ulos
schemaComposer.Query.addFields({
  //findByID toimii kute
  restaurantById: RestaurantTC.getResolver('findById'),
  //findOne ja findMany toimivat hakuna. Ilman arvoja tulevat kaikki
  restaurantOne: RestaurantTC.getResolver('findOne'),
  restaurantMany: RestaurantTC.getResolver('findMany'),
});

// esimerkkihaku löytää kaikki. näytetään nimi ja osoite
// {
//   restaurantMany(filter: {  }) {
//     name
//    address
//   }
// }

// haetaan pikku-kuppilaa. hakuun lisätty menu-näkymä ja rating
// {
//   restaurantMany(filter: { name: "pikku-kuppila" }) {
//     name
//     address
//     rating
//     manu {menuitem description price}
//   }
// }

//toisin kuin queryt, mutaatiot muokkaavat tietokannan sisältöä
schemaComposer.Mutation.addFields({
  //luomiskomento
  restaurantCreate: RestaurantTC.getResolver('createOne'),
  //muokataan opiskelijaa
  restaurantUpdate: RestaurantTC.getResolver('updateOne'),
  //poistetaan opiskelija
  restaurantRemove: RestaurantTC.getResolver('removeOne'),
  // uusien menu-tuotteiden lisääminen olemassaoleviin ravintoloihin
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  //käyttäjän rekisteröinti ja autentikointi
  registerUser: {
    type: AuthResponseTC,
    args: {
      username: 'String!',
      password: 'String!',
      isadmin: 'Boolean!',
    },
    resolve: (source, args, context, info) => {
      return userResolvers.registerUser(args);
    },
  },
  authenticateUser: {
    type: AuthResponseTC,
    args: {
      username: 'String!',
      password: 'String!',
    },
    resolve: (source, args, context, info) => {
      return userResolvers.authenticateUser(args);
    },
  },
});

// luodaan uusi ravintola nimeltä pikku-kuppila
// mutation {
//   restaurantCreate(record: {name: "pikku-kuppila", address: "kyöstikatu 5", rating: 4, menu: []}) {
//     record {
//       name
//       address
//       rating
//     }
//   }
// }

// lisätään pikku-kuppilalle valikoimaan burgeri
// mutation {
//   addMenuItem(
// name: "pikku-kuppila", menuitem: "burger",description:"itsgood", price: 5
//   ) {

//       name
//       address
//       rating
//       menu {
//         menuitem
//         description
//         price
//       }
//     }

// }

// muokataan burgerin hintaa
// mutation {
//   updateMenuItem(name: "pikku-kuppila", menuitem: "burger", newPrice: 6) {
//     name
//     menu {
//       menuitem
//       description
//       price
//     }
//   }
// }

// lisätään jotain
// mutation {
//   addMenuItem(
// name: "pikku-kuppila", menuitem: "slurper",description:"itsgood", price: 5
//   ) {

//       name
//       address
//       rating
//       menu {
//         menuitem
//         description
//         price
//       }
//     }

// }

// poistetaan se
// mutation {
//   removeMenuItem(name: "pikku-kuppila", menuitem: "slurper") {
//     name
//     address
//     rating
//     menu {
//       menuitem
//       description
//       price
//     }
//   }
// }

// käyttäjän luonti
// mutation {
//   registerUser(username: "testuser", password: "password123", isadmin: false) {
//     success
//     message
//     token
//   }
// }

// sisäänkirjautuminen
// mutation {
//   authenticateUser(username: "testuser", password: "password123") {
//     success
//     message
//     token
//   }
// }

const graphqlSchema = schemaComposer.buildSchema();
module.exports = graphqlSchema;
