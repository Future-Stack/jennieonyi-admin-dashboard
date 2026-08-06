class StripePayment {
  pay(amount) {
    console.log(`Paid ${amount} using Stripe`);
  }
}

class Checkout {
  constructor(paymentService) {
    this.paymentService = paymentService;
  }

  completeOrder(amount) {
    this.paymentService.pay(amount);
  }
}

const checkout = new Checkout(new StripePayment());
checkout.completeOrder(500);