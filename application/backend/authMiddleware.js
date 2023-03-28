//Security middleware for protecting router endpoints

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

module.exports = {
  checkSession: checkSession,
  checkUser: checkUser
}