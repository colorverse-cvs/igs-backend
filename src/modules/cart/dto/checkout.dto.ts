export class CheckoutDto {
  paymentMethod: 'razorpay' | 'cod';
  // if guest (no req.user) provide these:
  name?: string;
  email?: string;
  phone?: string; // E.164 +91...
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
}