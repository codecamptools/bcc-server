import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";

// Set up Auth0 configuration
const authConfig = {
  domain: process.env.AUTH_DOMAIN,
  clientId: process.env.AUTH_CLIENT_ID,
  audience: process.env.AUTH_AUDIENCE
};

const JWT_OPTIONS = {
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithm: ["RS256"]
};

export class AuthorizationService {
  static IsAuthorized(req, res, next) {
    return jwt({ ...JWT_OPTIONS, credentialsRequired: true })(req, res, next);
  }
  static isAdmin(req, res, next) {
    return jwt({ ...JWT_OPTIONS, userProperty: "admin" })(req, res, next);
  }
}
