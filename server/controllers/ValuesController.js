import express from "express";
import BaseController from "../utils/BaseController";
import { AuthorizationService } from "../services/AuthorizationService";
import { valuesService } from "../services/ValueService";

export class ValuesController extends BaseController {
  constructor() {
    super("api/values");
    this.router = express
      .Router()
      //NOTE  each route gets registered as a .get, .post, .put, or .delete, the first parameter of each method is a string to be concatinated onto the base url registered with the route in the super call. The second parameter is the method that will be run when this route is hit.
      .get("", this.getAll)
      .use("/:id", AuthorizationService.IsAuthorized)
      .get("/:id", this.getById);
  }

  async getAll(_, res, next) {
    try {
      valuesService.find({})
      return res.send(["value1", "value1"]);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      return res.send("value" + req.params.id);
    } catch (error) {
      next(error);
    }
  }
}
