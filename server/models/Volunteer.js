import { AzureStorageModel } from "../services/AzureStorageEntity";
import { BadRequest } from "../Utils/Errors";

export class Volunteer extends AzureStorageModel {
  firstName = "";
  lastName = "";
  email = "";
  preferedShift = "";
  shift = "";
  shirtSize = "";
  year = 2020;
  validate() {
    if (!this.firstName || !this.email) {
      BadRequest("You must provide your name and email");
    }
  }
}
