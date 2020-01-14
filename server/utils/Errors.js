export function Unauthorized(message = "Not Authorized") {
  throw { status: 401, message: message };
}
export function BadRequest(message = "Bad Request not found") {
  throw { status: 400, message: message };
}

export function Forbidden(message = "Access Denied: Insufficient Privledges") {
  throw {
    status: 403,
    message: message
  };
}
