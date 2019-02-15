const parseCookies = (req, res, next) => {
  var cookie = req.headers.cookie;
  var result = {};
  if (cookie === undefined) {
    req.cookies = result;
    return next();
  }
  if (cookie) {
    var twoCookies = cookie.split('=');

    if (twoCookies.length === 2) {
      result[twoCookies[0]] = twoCookies[1];
      req.cookies = result;
      return next();
    } else {
      cookie = cookie.split('; ');
      cookie.forEach((item) => {
        item = item.split('=');
        result[item[0]] = item[1];
      });
      req.cookies = result;
      return next();
    }
  }
};

module.exports = parseCookies;