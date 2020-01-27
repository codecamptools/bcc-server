import { AzureStorageModel } from "../services/AzureStorageEntity";
import { BadRequest } from "../Utils/Errors";

export class Sponsor extends AzureStorageModel {
  contact = {
    name: "",
    email: ""
  };
  url = "";
  logo = "";
  name = "";
  level = "";
  ppUpgrade = "";
  year = 2020;

  validate() {
    if (!this.contact.name || !this.contact.email) {
      throw BadRequest("You must provide your name and email");
    }
  }
}
