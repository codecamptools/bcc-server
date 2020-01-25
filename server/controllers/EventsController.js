import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";

export class EventsController extends BaseController {
  constructor() {
    super("api/events");
    this.router = express
      .Router()
      .get("", this.getAll)
      .use("", auth0Provider.isAuthorized)
      .post("", this.createEvent)
      .get("/:id", this.getById);
  }

  async getAll(_, res, next) {
    try {
      return res.send(["value1", "value1"]);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      return res.send({
        value: "value" + req.params.id,
        user: req.user,
        userInfo: req.userInfo
      });
    } catch (error) {
      next(error);
    }
  }
  async createEvent(req, res, next) {
    try {
      
      // let result = await AZURE_STORAGE.InsertEntity("events", req.body);
      // res.send(result);
    } catch (e) {
      next(e);
    }
  }
}
