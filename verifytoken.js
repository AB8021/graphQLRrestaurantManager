const jwt = require('jsonwebtoken');
const { parse } = require('graphql/language');
require('dotenv').config();
const secret = process.env.SECRET;

// verifyToken -funktio ottaa vastaan tokenin, dekoodaa ja tarkistaa sen
function verifyToken(req, res, next) {
  // otetaan vastaan token kahdella vaihtoehtoisella tavalla riippuen siitä onko se lähetetty
  // bodyssä vai headerissa
  const token = req.body.token || req.headers['x-access-token'];

  //tarkistetaan onko sallittu operaatio, jos on ei verifikaatiota
  let operationType;
  let operationName;
  try {
    const ast = parse(req.body.query);
    operationType = ast.definitions[0].operation;
    operationName = ast.definitions[0].selectionSet.selections[0].name.value;
    console.log(ast.definitions[0].selectionSet.selections[0].name.value);
  } catch (error) {
    return next();
  }

  const allowedMutations = ['registerUser', 'authenticateUser'];
  if (operationType === 'query' || (operationType === 'mutation' && allowedMutations.includes(operationName))) {
    return next();
  }

  // dekoodataan eli puretaan token
  if (token) {
    // verify tutkii tokenin voimassaolon ja salausmuuttujan
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        return res.json({
          success: false,
          message: 'Token virheellinen tai expiroitunut.',
        });
      } else {
        // Tallennetaan dekoodattu token request-olioon josta sitä voi jatkossa pyytää
        req.decoded = decoded;
        next(); // siirrytään eteenpäin seuraaviin reitteihin
      }
    });
  } else {
    // jos ei ole saatu tokenia, tulee error ja jäädään tähän
    return res.status(403).send({
      success: false,
      message: 'Tokenia ei ole.',
    });
  }
}

module.exports = verifyToken;
