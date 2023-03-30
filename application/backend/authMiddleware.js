//Security middleware for protecting router endpoints
const jwt = require('jsonwebtoken');

function checkUser(account) {
    return function (req, res, next) {
      if(account === "USER") {
        req.session.accountType === "USER" ? next() : res.status(401).json({message: "Unauthorised, please log in"});
      }
      if(account === "MANAGER") {
        req.session.accountType === "MANAGER" ? next() : res.status(401).json({message: "Unauthorised, please log in"});
      }
      if(account === "ADMIN") {
        req.session.accountType === "ADMIN" ? next() : res.status(401).json({message: "Unauthorised, please log in"});
      }
    }
}

function checkSession() {
  return function (req, res, next) {
    req.session.authenticated? next() : res.status(401).json({message: "Unauthorised, please log in"});
  }
};

function verifyToken() {
  return function(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
      const bearerToken = bearerHeader.split(' ')[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
          res.sendStatus(403); // forbidden
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.sendStatus(401); // unauthorized
    }
  };
}

/*
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    jwt.verify(bearerToken, process.env.JWT_SECRET, function(err, decoded) {
      if (err) {
        res.sendStatus(403); // forbidden
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.sendStatus(401); // unauthorized
  }
}*/

module.exports = {
  checkSession: checkSession,
  checkUser: checkUser,
  verifyToken: verifyToken
}