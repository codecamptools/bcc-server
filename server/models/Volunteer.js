import { AzureStorageModel } from "../services/AzureStorageEntity";
import { BadRequest } from "../Utils/Errors";

export class Volunteer extends AzureStorageModel {
  name = "";
  email = "";
  preferedShift = "";
  shift = "";
  shirtSize = "";
  year = 2020;
  validate() {
    if (!this.name || !this.email) {
      BadRequest("You must provide your name and email");
    }
  }
}
