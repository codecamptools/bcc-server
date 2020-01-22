import { AzureStorageService } from "./server/services/AzureUploadService";
import { PaypalService } from "./server/services/PaypalService";

export const AZURE_STORAGE = new AzureStorageService({
  name: process.env.AZURE_STORAGE_NAME,
  key: process.env.AZURE_STORAGE_KEY
});

export const PAYPAL = new PaypalService(
  process.env.PAYPAL_CLIENT_SANDBOX,
  process.env.PAYPAL_SECRET_SANDBOX,
  true
);
