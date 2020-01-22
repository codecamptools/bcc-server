import paypalCheckout from "@paypal/checkout-server-sdk";

export class PaypalService {
  constructor(client, secret, isSandbox = false) {
    let environment = new paypalCheckout.core.LiveEnvironment(client, secret);

    if (isSandbox) {
      environment = new paypalCheckout.core.SandboxEnvironment(client, secret);
    }
    this.client = new paypalCheckout.core.PayPalHttpClient(environment);
  }

  async GetValidPurchase(orderId) {
    let request = new paypalCheckout.orders.OrdersGetRequest(orderId);
    // request.headers["prefer"] = "return=representation";
    let order = await this.client.execute(request);
    return order.result;
  }
}
