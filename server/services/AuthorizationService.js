import jwt from "express-jwt";
import jwksRsa from "jwks-rsa";
import axios from "axios";
import { Unauthorized } from "../utils/Errors";
import Cache from "node-cache";

const userProfileCache = new Cache({ stdTTL: 60 * 60 });

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
  static hasPermission(permission) {
    return (req, res, next) => {
      this.IsAuthorized(req, res, () => {
        try {
          if (req.user.permissions.includes(permission)) {
            return next();
          }
          Unauthorized("Invalid Permissions");
        } catch (e) {
          next(e);
        }
      });
    };
  }
  static async getUserProfile(req, _, next) {
    try {
      if (userProfileCache.has(req.user.sub)) {
        req.userInfo = userProfileCache.get(req.user.sub);
        req.userInfo.fromCache = true;
        return next();
      }
      let res = await axios.get(`https://${authConfig.domain}/userinfo`, {
        headers: {
          authorization: req.headers.authorization
        }
      });
      req.userInfo = {};
      for (var key in res.data) {
        let keep = key;
        if (key.includes("https")) {
          keep = keep.slice(keep.lastIndexOf("/") + 1);
        }
        req.userInfo[keep] = res.data[key];
      }
      userProfileCache.set(req.user.sub, req.userInfo);
      next();
    } catch (e) {
      next(e);
    }
  }
}
