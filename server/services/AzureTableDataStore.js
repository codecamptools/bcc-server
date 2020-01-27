import { AzureStorageService } from "./AzureStorageService";
import { AzureStorageSet } from "./AzureStorageEntity";
import { Sponsor } from "../models/Sponsor";
import { Payment } from "../models/Payment";
import { Volunteer } from "../models/Volunteer";

export class AzureTableDataStore {
  /**
   * @param {AzureStorageService} storageService
   */
  constructor(storageService) {
    this.storageService = storageService;
    for (let k in this) {
      let field = this[k];
      if (field instanceof AzureStorageSet) {
        field.___storageService = storageService;
      }
    }
  }

  /**
   * @type {AzureStorageSet<Sponsor>}
   */
  Sponsors = new AzureStorageSet("Sponsors", Sponsor, this.storageService);

  /**
   * @type {AzureStorageSet<Payment>}
   */
  Payments = new AzureStorageSet("Payments", Payment, this.storageService);

  /**
   * @type {AzureStorageSet<Volunteer>}
   */
  Volunteers = new AzureStorageSet(
    "Volunteers",
    Volunteer,
    this.storageService
  );
}
