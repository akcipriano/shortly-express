const parseCookies = (req, res, next) => {
  var result = {};
  if (req.headers.cookie === undefined) {
    result = {};
  }
  console.log('req----', req);
  console.log('req.headers----', req.headers);
  console.log('req.cookies', Object.keys(req.cookies));
  var cookie = req.cookies;
  cookie = cookie.split('=');
  if (cookie.length === 2) {
    result[cookie[0]] = cookie[1];
  } else {
    cookie = req.cookies.split('; ');
    cookie.forEach((item) => {
      item = item.split('=');
      result[item[0]] = item[1];
    });
  }
  next(result);
};

module.exports = parseCookies;