import express from "express";
import BaseController from "../utils/BaseController";
import auth0Provider from "@bcwdev/auth0Provider";
import { PAYPAL, AZURE_STORAGE } from "../../AppServices";
import { StorageEntity } from "../services/AzureUploadService";

export class SponsorsController extends BaseController {
  constructor() {
    super("api/sponsors");
    this.router = express
      .Router()
      .post("/validate-purchase/:orderId", this.createSponsorFromPurchase);
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

      let sponsorEntity = new StorageEntity(req.body, key, req.params.orderId);

      let sponsor = await AZURE_STORAGE.InsertEntity("sponsors", sponsorEntity);

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
}
async function uploadSponsorLogo(req) {
  try {
    let key = `${req.body.eventDetails.name}/${req.body.eventDetails.year}`;
    if (req.body.logo64) {
      let sponsorLogo = await AZURE_STORAGE.WriteBase64FileToContainerAsync(
        "sponsors",
        key,
        { name: req.body.companyDetails.name, base64: req.body.logo64 }
      );
      req.body.companyDetails.logo = sponsorLogo;
      delete req.body.logo64;
    }
    return key;
  } catch (e) {
    throw e;
  }
}
