import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";
import { PAYPAL, AZURE_DATA_STORE } from "../../AppServices";

export class SponsorsController extends BaseController {
  constructor() {
    super("api/sponsors");
    this.router = express
      .Router()
      .get("", this.getSponsors)
      .post("", this.createSponsor)
      .delete("/:id", this.deleteSponsor)
      .get("/:id", this.getSponsor)
      .post("/validate-purchase/:orderId", this.createSponsorFromPurchase);
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
      console.log("order found", order);
    } catch (e) {
      return next(e);
    }
    try {
      let key = await uploadSponsorLogo(req);

      // let sponsorEntity = new AzureStorageEntity(req.body, key, req.params.orderId);

      // let sponsor = await AZURE_STORAGE.InsertEntity("sponsors", sponsorEntity);

      res.send({
        message: `Thank you for sponsoring ${key.replace("/", " ")}`
      });
    } catch (e) {
      res.send({
        message: `Thank you for sponsoring! Your transaction was approved however something went wrong while confirming your account information. Don't worry we will be in touch soon to resolve this issue`,
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
}
async function uploadSponsorLogo(req) {
  // try {
  //   let key = `${req.body.eventDetails.name}/${req.body.eventDetails.year}`;
  //   if (req.body.logo64) {
  //     let sponsorLogo = await AZURE_STORAGE.WriteBase64FileToContainerAsync(
  //       "sponsors",
  //       key,
  //       { name: req.body.companyDetails.name, base64: req.body.logo64 }
  //     );
  //     req.body.companyDetails.logo = sponsorLogo;
  //     delete req.body.logo64;
  //   }
  //   return key;
  // } catch (e) {
  //   throw e;
  // }
}
