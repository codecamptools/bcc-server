import express from "express";
import Socket from "./Services/SocketService";
import Startup from "./Startup";
import fs from "fs";
import path from "path";

//create server & socketServer
const app = express();
let socketServer = null;

if(process.env.USE_HTTPS){
  const options = {
    key: fs.readFileSync(path.join(__dirname, 'certs','dev_key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'certs','dev_cert.pem')),
    passphrase: 'bccrocks'
  };
  socketServer = require("https").createServer(options,app);
}
else{
  socketServer = require("http").createServer(app);
}

const io = require("socket.io")(socketServer);
const port = process.env.PORT;

//Establish Socket
Socket.setIO(io);
Startup.ConfigureGlobalMiddleware(app);
Startup.ConfigureRoutes(app);

//Start Server
socketServer.listen(port, () => {
  console.log("Server running on port:", port);
});
