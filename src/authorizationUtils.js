const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');

function checkAccessToken(issuer, audience) {
  return jwt({
    secret: jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${issuer}/.well-known/jwks.json`
    }),

    // Validate the audience and the issuer.
    audience,
    issuer: `https://${issuer}/`,
    algorithms: ['RS256']
  })
}

function checkPermission(permission) {
  return (req, res, next) => {
    const {permissions} = req.user;
    console.log(permissions);
    if (permissions.includes(permission)) return next();
    res.status(403).send();
  }
}

module.exports = {
  checkAccessToken,
  checkPermission,
};
