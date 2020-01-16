import express from "express";
import BaseController from "../utils/BaseController";
import { valuesService } from "../services/ValueService";
import auth0Provider from "@bcwdev/auth0Provider";

export class ValuesController extends BaseController {
  constructor() {
    super("api/values");
    this.router = express
      .Router()
      .get("", this.getAll)
      .use("/:id", auth0Provider.isAuthorized)
      .get("/:id", this.getById);
  }

  async getAll(_, res, next) {
    try {
      valuesService.find({});
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
}
