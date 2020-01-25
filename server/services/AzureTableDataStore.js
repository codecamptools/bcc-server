import { AzureStorageService } from "./AzureStorageService";
import { AzureStorageSet } from "./AzureStorageEntity";
import { Sponsor } from "../models/Sponsor";

export class AzureTableDataStore {
  /**
   * @param {AzureStorageService} storageService
   */
  constructor(storageService) {
    this.storageService = storageService;
    this.Sponsors.___storageService = storageService;
  }

  /**
   * @type {AzureStorageSet<Sponsor>}
   */
  Sponsors = new AzureStorageSet("Sponsors", Sponsor, this.storageService);
}
