import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";
import { AZURE_DATA_STORE } from "../../AppServices";

export class VolunteersController extends BaseController {
  constructor() {
    super("api/volunteers");
    this.router = express
      .Router()
      .post("", this.createVolunteer)
      .use("", auth0Provider.hasPermissions("read:volunteers"))
      .get("", this.getAll)
      .use("", auth0Provider.hasPermissions("edit:volunteers"))
      .put("/:id", this.editVoulunteer)
      .delete("/:id", this.deleteVoulunteer);
  }

  async createVolunteer(req, res, next) {
    try {
      let volunteer = await AZURE_DATA_STORE.Volunteers.CreateOrUpdate(
        req.body
      );
      res.send(volunteer);
    } catch (e) {
      next(e);
    }
  }
  async getAll(req, res, next) {
    try {
      let sponsors = await AZURE_DATA_STORE.Volunteers.find(req.query);
      res.send(sponsors);
    } catch (error) {
      next(error);
    }
  }
  async getById(req, res, next) {
    try {
      try {
        let sponsor = await AZURE_DATA_STORE.Volunteers.findById(req.params.id);
        res.send(sponsor);
      } catch (error) {
        next(error);
      }
    } catch (error) {
      next(error);
    }
  }
  async editVoulunteer(req, res, next) {
    try {
      await AZURE_DATA_STORE.Volunteers.findById(req.params.id);
      req.body.id = req.params.id;
      let volunteer = await AZURE_DATA_STORE.Volunteers.CreateOrUpdate(
        req.body
      );
      res.send(volunteer);
    } catch (e) {
      next(e);
    }
  }
  async deleteVoulunteer(req, res, next) {
    try {
      let result = await AZURE_DATA_STORE.Volunteers.findByIdAndRemove(
        req.params.id
      );
      res.send(result);
    } catch (e) {
      next(e);
    }
  }
}
