export const basicAuth = (req, res, next) => {
  const { BASIC_AUTH_USER, BASIC_AUTH_PASS } = process.env;
  // If credentials are not set, allow the request
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASS) {
    return next();
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) {
    res.set('WWW-Authenticate', 'Basic realm="Restricted"');
    return res.status(401).send('Authentication required');
  }

  const decoded = Buffer.from(encoded, 'base64').toString();
  const [user, pass] = decoded.split(':');

  if (user !== BASIC_AUTH_USER || pass !== BASIC_AUTH_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="Restricted"');
    return res.status(401).send('Authentication failed');
  }

  next();
};

export const ipWhitelist = (req, res, next) => {
  const allowed = process.env.ALLOWED_IP;
  if (!allowed) return next();

  const requestIp = req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : req.ip;

  if (requestIp !== allowed) {
    return res.status(403).send('Forbidden');
  }

  next();
};

export const securityMiddleware = (req, res, next) => {
  basicAuth(req, res, () => {
    if (res.headersSent) return;
    ipWhitelist(req, res, next);
  });
};
