import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY?.trim();

const client = secret ? new Stripe(secret) : null;

export default client;
