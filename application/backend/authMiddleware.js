//Security middleware for protecting router endpoints
const jwt = require('jsonwebtoken');

/*
function checkUser(account) {
    return function (req, res, next) {
      console.log(req.session);
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
}*/

function checkUser(accounts) {
  return function(req, res, next) {
    const sessions = req.sessionStore.sessions;
    const sessionId = Object.keys(sessions)[0];
    const session = JSON.parse(sessions[sessionId]);
    const accountType = session.accountType;

    //Note: This line does not work on my device but works via postman. This is the standard approach, however due to either browser or
    //machine issues, I had to do a workaround and check the server session storage instead.
    //const accountType = req.session.accountType;
    if (!accountType || !accounts.includes(accountType)) {
      res.status(401).json({ message: "Unauthorized, please log in" });
    } else {
      next();
    }
  };
}

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
  checkUser: checkUser,
  verifyToken: verifyToken
}