import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";
import { PAYPAL, AZURE_DATA_STORE, AZURE_STORAGE } from "../../AppServices";

export class SponsorsController extends BaseController {
  constructor() {
    super("api/sponsors");
    this.router = express
      .Router()
      .get("", this.getSponsors)
      .get("/:id", this.getSponsor)
      .post("/validate-purchase/:orderId", this.createSponsorFromPurchase)
      .use("", auth0Provider.hasPermissions("edit:sponsors"))
      .post("", this.createSponsor)
      .put("/:id", this.createSponsor)
      .put("/:id/logo", this.setSponsorLogo)
      .delete("/:id", this.deleteSponsor);
  }

  async getSponsors(req, res, next) {
    try {
      let sponsors = await AZURE_DATA_STORE.Sponsors.find(req.query);
      res.send(sponsors);
    } catch (e) {
      next(e);
    }
  }
  async getSponsor(req, res, next) {
    try {
      let sponsor = await AZURE_DATA_STORE.Sponsors.findById(req.params.id);
      res.send(sponsor);
    } catch (e) {
      next(e);
    }
  }

  async createSponsorFromPurchase(req, res, next) {
    let order;
    try {
      order = await PAYPAL.GetValidPurchase(req.params.orderId);
    } catch (e) {
      return next(e);
    }
    try {
      req.body.sponsor.logo = await uploadSponsorLogo(req.body.sponsor, req.body.logo64);
      let sponsor = await AZURE_DATA_STORE.Sponsors.CreateOrUpdate(
        req.body.sponor
      );
      order.sponsorId = sponsor.id;
      let payment = await AZURE_DATA_STORE.Payments.CreateOrUpdate(order);

      res.send({
        message: `Thank you for sponsoring Boise Code Camp!`,
        confirmation: payment.orderID,
        sponsor
      });
    } catch (e) {
      res.send({
        message: `Thank you for sponsoring Boise Code Camp!`,
        confirmation: order.orderID,
        error: e.message
      });
    }
  }

  async createSponsor(req, res, next) {
    try {
      let sponsor = await AZURE_DATA_STORE.Sponsors.CreateOrUpdate(req.body);
      res.send(sponsor);
    } catch (error) {
      next(error);
    }
  }
  async deleteSponsor(req, res, next) {
    try {
      let removed = await AZURE_DATA_STORE.Sponsors.findByIdAndRemove(
        req.params.id
      );
      res.send(removed);
    } catch (error) {
      next(error);
    }
  }
  async setSponsorLogo(req, res, next) {
    try {
      let sponsor = await AZURE_DATA_STORE.Sponsors.findById(req.params.id);
      sponsor.logo = await uploadSponsorLogo(sponsor, req.body.logo64);
      await AZURE_DATA_STORE.Sponsors.CreateOrUpdate(sponsor);
      res.send(sponsor);
    } catch (e) {
      next(e);
    }
  }
}

async function uploadSponsorLogo(sponsor, logo64) {
  try {
    let key = `${sponsor.year}/${sponsor.name}`;
    if (logo64) {
      let sponsorLogo = await AZURE_STORAGE.WriteBase64FileToContainerAsync(
        "sponsors",
        key,
        { name: sponsor.name, base64: logo64 }
      );
      
      return sponsorLogo;
    }
    return null;
  } catch (e) {
    throw e;
  }
}
