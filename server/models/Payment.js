import { AzureStorageModel } from "../services/AzureStorageEntity";
export class Payment extends AzureStorageModel {
  orderID = "";
  create_time = "";
  update_time = "";
  intent = "";
  status = "";
  payer = {
    email_address: "",
    payer_id: "",
    address: { country_code: "" },
    name: { given_name: "", surname: "" }
  };
  purchase_units = [];
  links = [];
  sponsorId = "";
}
