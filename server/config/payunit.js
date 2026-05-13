// payunit/client.js
import { PayunitClient } from '@payunit/nodejs-sdk';
import dotenv from 'dotenv';
dotenv.config();

export const client = new PayunitClient({
  apiKey: process.env.PAYUNIT_API_KEY,
  apiUsername: process.env.PAYUNIT_API_USERNAME,
  apiPassword: process.env.PAYUNIT_API_PASSWORD,
  mode: process.env.PAYUNIT_MODE || 'test',
  baseURL: 'https://gateway.payunit.net',
  timeout: 10000,
});