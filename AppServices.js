import { AzureStorageService } from "./server/services/AzureStorageService";
import { PaypalService } from "./server/services/PaypalService";
import { AzureTableDataStore } from "./server/services/AzureTableDataStore";

export const PAYPAL = new PaypalService(
  process.env.PAYPAL_CLIENT,
  process.env.PAYPAL_SECRET,
  process.env.PAYPAL_ENV == 'sandbox'
);

export const AZURE_STORAGE = new AzureStorageService({
  name: process.env.AZURE_STORAGE_NAME,
  key: process.env.AZURE_STORAGE_KEY
});

export const AZURE_DATA_STORE = new AzureTableDataStore(AZURE_STORAGE);
