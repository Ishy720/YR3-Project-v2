/*
  This file contains and exports security middleware for the server's endpoints that the client website communicates with.
*/

//Module imports
const jwt = require('jsonwebtoken');

//old static checkUser middleware, works fine but not used.
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

//middleware that integrates with endpoints to dynamically check if the user accessing the endpoint has the permissions.
//takes in a string array of account types that are allowed to access the specific endpoint.
function checkUser(accounts) {
  return function(req, res, next) {

    //get the user's session which contains their account type data

    //Note: This way does not work on my device but works via testing from postman. This is the standard way to get
    //the user's session data, however due to browser issues, I had to do a workaround and check the server session storage instead.
    //const accountType = req.session.accountType;

    //getting the user session workaround
    const sessions = req.sessionStore.sessions;
    const sessionId = Object.keys(sessions)[0];
    const session = JSON.parse(sessions[sessionId]);
    const accountType = session.accountType;

    //check if the user's account type stored in the session is included in the declared authorised account types.
    if (!accountType || !accounts.includes(accountType)) {
      res.status(401).json({ message: "Unauthorized, please log in" });
    } else {
      //user is authorised, continue to the next function in the endpoint
      next();
    }
  };
}

//middleware that checks if the incoming HTTP request to the endpoint contains the expected JWT token to determine if the request came from
//a genuine user from the client.
function verifyToken() {
  return function(req, res, next) {
    //get the auth header of the request
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
      //get and verify the JWT token inside the auth header
      const bearerToken = bearerHeader.split(' ')[1];
      jwt.verify(bearerToken, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
          //forbidden, the JWT token was invalid
          res.sendStatus(403);
        } else {
          //user is authorised, continue to the next function in the endpoint
          req.decoded = decoded;
          next();
        }
      });
    } else {
      //unauthorised, there were no auth headers indicating the request didn't genuinely come from our client.
      res.sendStatus(401);
    }
  };
}




//track request origins
const reqOriginArray = {};

//max requests per time expiry period
const maxRequests = 100;

//time expiry period
const timeoutPeriod = 30;

//middleware that limits the HTTP request rate that an endpoint can recieve. it is hardcoded to take in 100 requests per 30 seconds, so it does not 
//affect genuine user usability, but prevents abnormal influxes of requests.
function limitCallRate(req, res, next) {

  //get the request sender's IP
  const senderIP = req.ip;

  //get the current time
  const currentTime = Date.now(); 

  //check if the user's ip exceeded the request limit
  if (reqOriginArray[senderIP]) {
      //if same ip has too many requests before timeout period
      if (reqOriginArray[senderIP].count >= maxRequests && currentTime - reqOriginArray[senderIP].timestamp < timeoutPeriod) {
          return res.status(429).json({ error: "Too many incoming requests, try again later." });
      }

      //check IP exceeded request limit but timeout passed, if so reset request count
      if (currentTime - reqOriginArray[senderIP].timestamp > timeoutPeriod) {
          reqOriginArray[senderIP].count = 0;
          reqOriginArray[senderIP].timestamp = currentTime;
      }
  } else {
      //first request from user's ip, initialize the request count for that ip and timestamp
      reqOriginArray[senderIP] = {
          count: 0,
          timestamp: currentTime
      };
  }

  //increment ip request counter
  reqOriginArray[senderIP].count++;

  //proceed to endpoint
  return next();
}

module.exports = {
  checkUser: checkUser,
  verifyToken: verifyToken,
  limitCallRate: limitCallRate
}