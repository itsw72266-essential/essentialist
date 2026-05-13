// import nodemailer from "nodemailer";
// import twilio from "twilio";
// import sendEmail from "../config/sendEmail.js";
// import AddressModel from "../models/address.model.js";

// const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
// const ADMIN_EMAIL_PASS = process.env.ADMIN_EMAIL_PASS;
// const ADMIN_RECEIVE_EMAIL = process.env.ADMIN_RECEIVE_EMAIL;
// const BRAND_NAME = process.env.BRAND_NAME ?? "Customer Service";
// const SUPPORT_EMAIL =
//   process.env.SUPPORT_EMAIL || ADMIN_EMAIL || ADMIN_RECEIVE_EMAIL;

// function extractEmailAddress(input) {
//   if (!input) return null;
//   const match = input.match(/<([^>]+)>/);
//   if (match) return match[1];
//   if (input.includes("@")) return input;
//   return null;
// }

// const RESEND_SENDER_EMAIL =
//   extractEmailAddress(process.env.RESEND_SENDER) ?? "onboarding@resend.dev";

// export const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: ADMIN_EMAIL,
//     pass: ADMIN_EMAIL_PASS,
//   },
// });

// const canUseTwilio =
//   Boolean(process.env.TWILIO_ACCOUNT_SID) &&
//   Boolean(process.env.TWILIO_AUTH_TOKEN) &&
//   Boolean(process.env.TWILIO_WHATSAPP_FROM);

// let twilioClient = null;
// if (canUseTwilio) {
//   twilioClient = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
// }

// function normaliseWhatsAppPhone(phone) {
//   if (!phone) return null;

//   const sanitized = phone.replace(/[^\d+]/g, "");
//   if (!sanitized) return null;

//   if (sanitized.startsWith("+")) {
//     return sanitized;
//   }

//   const defaultCode = process.env.DEFAULT_WHATSAPP_COUNTRY_CODE ?? "";
//   if (defaultCode.startsWith("+")) {
//     return `${defaultCode}${sanitized}`;
//   }
//   if (defaultCode) {
//     return `+${defaultCode}${sanitized}`;
//   }

//   return null;
// }

// async function sendWhatsAppMessage({ to, body }) {
//   if (!twilioClient) {
//     console.info(
//       "sendWhatsAppMessage: Twilio not configured, skipping WhatsApp notification."
//     );
//     return;
//   }

//   const recipient = normaliseWhatsAppPhone(to);
//   if (!recipient) {
//     console.warn(
//       "sendWhatsAppMessage: invalid phone number, skipping WhatsApp notification."
//     );
//     return;
//   }

//   try {
//     await twilioClient.messages.create({
//       from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
//       to: `whatsapp:${recipient}`,
//       body,
//     });
//   } catch (error) {
//     console.error("sendWhatsAppMessage: failed to send WhatsApp message", error);
//   }
// }

// async function sendEmailWithFallback({
//   to,
//   subject,
//   text,
//   html,
//   replyTo,
//   fromName,
//   fromEmail,
// }) {
//   const recipients = Array.isArray(to)
//     ? to.filter(Boolean)
//     : [to].filter(Boolean);

//   if (!recipients.length) {
//     console.warn("sendEmailWithFallback: no recipients provided");
//     return false;
//   }

//   const resolvedFromName = fromName ?? BRAND_NAME;
//   const resolvedFromEmail = fromEmail ?? ADMIN_EMAIL;
//   const plainText = text && text.trim().length ? text : undefined;
//   const htmlBody =
//     html ??
//     (plainText
//       ? `<pre style="white-space:pre-wrap">${plainText}</pre>`
//       : undefined);

//   if (process.env.RESEND_API) {
//     const resendFrom = `${resolvedFromName} <${RESEND_SENDER_EMAIL}>`;
//     const resendResult = await sendEmail({
//       sendTo: recipients,
//       subject,
//       html: htmlBody,
//       text: plainText,
//       replyTo,
//       from: resendFrom,
//     });

//     if (resendResult?.success) {
//       return true;
//     }

//     console.warn(
//       "sendEmailWithFallback: Resend delivery failed, attempting Nodemailer fallback."
//     );
//   }

//   try {
//     await transporter.sendMail({
//       from: `"${resolvedFromName}" <${resolvedFromEmail}>`,
//       to: recipients,
//       subject,
//       text: plainText,
//       html: htmlBody,
//       replyTo,
//     });
//     return true;
//   } catch (error) {
//     console.error("sendEmailWithFallback: transporter send failed", error);
//     return false;
//   }
// }

// function formatProductsForEmail(products = []) {
//   if (!Array.isArray(products) || !products.length) {
//     return "No products listed.";
//   }

//   return products
//     .map((prod, idx) => {
//       const images = Array.isArray(prod.product_details?.image)
//         ? prod.product_details.image.join(", ")
//         : prod.product_details?.image ?? "N/A";

//       return `#${idx + 1}
//   Product: ${prod.product_details?.name ?? "N/A"}
//   Qty: ${prod.quantity ?? 0}
//   Price: ${prod.price ?? 0}
//   Images: ${images}`.trim();
//     })
//     .join("\n\n");
// }

// function formatAddress(addressObj) {
//   if (!addressObj || typeof addressObj !== "object") return "N/A";

//   return [
//     addressObj.address_line,
//     `${addressObj.city ?? ""}${addressObj.state ? `, ${addressObj.state}` : ""}`,
//     `${addressObj.country ?? ""} ${addressObj.pincode ?? ""}`.trim(),
//     addressObj.mobile ? `Mobile: ${addressObj.mobile}` : null,
//   ]
//     .filter(Boolean)
//     .join("\n");
// }

// async function resolveAddressObject(order) {
//   let addressObj = order?.delivery_address ?? null;
//   if (
//     addressObj &&
//     typeof addressObj === "string" &&
//     addressObj.length >= 12
//   ) {
//     try {
//       addressObj = await AddressModel.findById(addressObj).lean();
//     } catch (error) {
//       console.error(
//         "resolveAddressObject: failed to look up address by id",
//         error
//       );
//       addressObj = null;
//     }
//   }
//   return addressObj ?? order?.delivery_address ?? null;
// }

// function resolveCustomerContact(order, addressObj) {
//   const name =
//     addressObj?.name ??
//     order?.contact_info?.name ??
//     order?.customer?.name ??
//     "Customer";

//   const email =
//     order?.contact_info?.customer_email ??
//     order?.contact_info?.email ??
//     addressObj?.customer_email ??
//     order?.customer?.email ??
//     null;

//   const phone =
//     order?.contact_info?.mobile ??
//     order?.contact_info?.phone ??
//     addressObj?.mobile ??
//     order?.customer?.phone ??
//     null;

//   return { name, email, phone };
// }

// function formatOrderEmailForCustomer(order, addressObj) {
//   const addressText = formatAddress(addressObj ?? order?.delivery_address);
//   const paymentStatus =
//     order?.payment_status ?? order?.paymentStatus ?? "Processing";
//   const paymentMethod =
//     order?.paymentMethod ??
//     order?.payment_method ??
//     (paymentStatus === "CASH ON DELIVERY" ? "Cash on Delivery" : "Online");

//   return `
// Order ID: ${order?.orderId ?? order?._id ?? "N/A"}
// Payment Status: ${paymentStatus}
// Payment Method: ${paymentMethod}

// Products:
// ${formatProductsForEmail(order?.products)}

// Total: ${order?.totalAmt ?? order?.subTotalAmt ?? 0}

// Delivery Address:
// ${addressText}
// `.trim();
// }

// export async function sendOrderNotificationToAdmin(orderArray = []) {
//   if (!ADMIN_RECEIVE_EMAIL) {
//     console.warn(
//       "sendOrderNotificationToAdmin: ADMIN_RECEIVE_EMAIL is not set, skipping email notifications."
//     );
//     return;
//   }

//   for (const order of orderArray) {
//     let addressObj = order.delivery_address;
//     if (
//       addressObj &&
//       typeof addressObj === "string" &&
//       addressObj.length >= 12
//     ) {
//       try {
//         addressObj = await AddressModel.findById(addressObj).lean();
//       } catch (error) {
//         console.error(
//           "sendOrderNotificationToAdmin: failed to look up address by id",
//           error
//         );
//         addressObj = null;
//       }
//     }

//     const addressText = formatAddress(addressObj ?? order.delivery_address);
//     const customerName =
//       addressObj?.name ?? order.contact_info?.name ?? "Customer";
//     const customerEmail =
//       order.contact_info?.customer_email ??
//       addressObj?.customer_email ??
//       "N/A";
//     const customerPhone =
//       order.contact_info?.mobile ?? addressObj?.mobile ?? "N/A";

//     const subject = `${
//       order.is_guest ? "[GUEST] " : ""
//     }New Order: ${order.orderId}`;
//     const text = `
// Order ID: ${order.orderId}
// Products:
// ${formatProductsForEmail(order.products)}

// Total: ${order.totalAmt ?? order.subTotalAmt ?? 0}
// Customer Name: ${customerName}
// Customer Email: ${customerEmail}
// Customer Phone: ${customerPhone}
// Customer Address:
// ${addressText}
// ${order.is_guest ? "GUEST ORDER: Yes" : ""}
// `.trim();

//     await sendEmailWithFallback({
//       to: ADMIN_RECEIVE_EMAIL,
//       subject,
//       text,
//       fromName: customerName,
//       fromEmail: ADMIN_EMAIL,
//       replyTo: customerEmail !== "N/A" ? customerEmail : undefined,
//     });
//   }
// }

// export async function sendOrderNotificationToCustomer(order) {
//   if (!order) return;

//   const addressObj = await resolveAddressObject(order);
//   const { name, email, phone } = resolveCustomerContact(order, addressObj);

//   const subject = `Order Confirmation: ${order.orderId ?? order._id ?? ""}`;
//   const body = `
// Hi ${name},

// Thank you for your order! We have received it successfully.

// ${formatOrderEmailForCustomer(order, addressObj)}

// If you have any questions, please reply to this email.

// Thank you for shopping with us!
// `.trim();

//   if (email) {
//     await sendEmailWithFallback({
//       to: email,
//       subject,
//       text: body,
//       fromName: BRAND_NAME,
//       fromEmail: ADMIN_EMAIL,
//       replyTo: SUPPORT_EMAIL || undefined,
//     });
//   }

//   if (phone) {
//     const whatsappBody = `Hi ${name}, we received your order ${
//       order.orderId ?? order._id ?? ""
//     }. Total: ${order.totalAmt ?? order.subTotalAmt ?? 0}. Thank you for shopping with us!`;
//     await sendWhatsAppMessage({ to: phone, body: whatsappBody });
//   }
// }

// export async function sendPayunitPaymentNotification({
//   orderId,
//   transactionId,
//   amount,
//   currency = "XAF",
//   status,
//   channel,
//   customerName,
//   customerEmail,
//   customerPhone,
// } = {}) {
//   const resolvedOrderId = orderId ?? transactionId ?? "N/A";
//   const resolvedStatus = status ?? "UNKNOWN";
//   const channelLabel = channel ?? "Payunit";

//   const adminSubject = `Payment ${resolvedStatus}: ${resolvedOrderId}`;
//   const adminBody = `
// Payment Update (Payunit)

// Order ID: ${resolvedOrderId}
// Transaction ID: ${transactionId ?? "N/A"}
// Status: ${resolvedStatus}
// Channel: ${channelLabel}
// Amount: ${amount ?? "N/A"} ${currency}

// Customer Name: ${customerName ?? "N/A"}
// Customer Email: ${customerEmail ?? "N/A"}
// Customer Phone: ${customerPhone ?? "N/A"}
// `.trim();

//   if (ADMIN_RECEIVE_EMAIL) {
//     await sendEmailWithFallback({
//       to: ADMIN_RECEIVE_EMAIL,
//       subject: adminSubject,
//       text: adminBody,
//       fromName: "Payments Robot",
//       fromEmail: ADMIN_EMAIL,
//     });
//   }

//   if (customerEmail) {
//     const customerSubject = `Payment ${resolvedStatus}: ${resolvedOrderId}`;
//     const customerBody = `
// Hi ${customerName ?? "Customer"},

// We have received your payment.

// Order ID: ${resolvedOrderId}
// Status: ${resolvedStatus}
// Channel: ${channelLabel}
// Amount: ${amount ?? "N/A"} ${currency}

// Thank you for shopping with us!
// `.trim();

//     await sendEmailWithFallback({
//       to: customerEmail,
//       subject: customerSubject,
//       text: customerBody,
//       fromName: BRAND_NAME,
//       fromEmail: ADMIN_EMAIL,
//       replyTo: SUPPORT_EMAIL || undefined,
//     });
//   }

//   if (customerPhone) {
//     const whatsappBody = `Hi ${customerName ?? "Customer"}, your payment (${resolvedStatus}) for order ${resolvedOrderId} was received. Amount: ${amount ?? "N/A"} ${currency}. Thank you!`;
//     await sendWhatsAppMessage({ to: customerPhone, body: whatsappBody });
//   }
// }

// export async function sendDeliveryConfirmationNotification(order) {
//   if (!order) return;

//   const customerEmail =
//     order.contact_info?.customer_email ??
//     order.delivery_address?.customer_email ??
//     null;
//   const customerPhone =
//     order.contact_info?.mobile ?? order.delivery_address?.mobile ?? null;
//   const customerName =
//     order.contact_info?.name ??
//     order.delivery_address?.name ??
//     "Valued Customer";
//   const orderId = order.orderId ?? order._id;

//   const emailSubject = `Delivery Confirmation: ${orderId}`;
//   const emailBody = `
// Hi ${customerName},

// Great news! Your order ${orderId} has been successfully delivered.

// If you have any questions or concerns, simply reply to this email or contact support.

// Thank you for shopping with us!
// `.trim();

//   if (customerEmail) {
//     await sendEmailWithFallback({
//       to: customerEmail,
//       subject: emailSubject,
//       text: emailBody,
//       fromName: BRAND_NAME,
//       fromEmail: ADMIN_EMAIL,
//       replyTo: SUPPORT_EMAIL || undefined,
//     });
//   }

//   if (customerPhone) {
//     const whatsappBody = `Hi ${customerName}, your order ${orderId} has just been delivered. Thank you for shopping with us!`;
//     await sendWhatsAppMessage({ to: customerPhone, body: whatsappBody });
//   }
// }



import nodemailer from "nodemailer";
import twilio from "twilio";
import sendEmail from "../config/sendEmail.js";
import AddressModel from "../models/address.model.js";
import UserModel from "../models/user.model.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_EMAIL_PASS = process.env.ADMIN_EMAIL_PASS;
const ADMIN_RECEIVE_EMAIL = process.env.ADMIN_RECEIVE_EMAIL;
const BRAND_NAME = process.env.BRAND_NAME ?? "Customer Service";
const SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL || ADMIN_EMAIL || ADMIN_RECEIVE_EMAIL;

function extractEmailAddress(input) {
  if (!input) return null;
  const match = input.match(/<([^>]+)>/);
  if (match) return match[1];
  if (input.includes("@")) return input;
  return null;
}

const RESEND_SENDER_EMAIL =
  extractEmailAddress(process.env.RESEND_SENDER) ?? "onboarding@resend.dev";

const MAIL_TIMEOUT_MS = Number(process.env.MAIL_TIMEOUT_MS ?? 12000);

export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: ADMIN_EMAIL,
    pass: ADMIN_EMAIL_PASS,
  },
  connectionTimeout: MAIL_TIMEOUT_MS,
  greetingTimeout: MAIL_TIMEOUT_MS,
  socketTimeout: MAIL_TIMEOUT_MS + 3000,
});

const canUseNodemailer = Boolean(ADMIN_EMAIL) && Boolean(ADMIN_EMAIL_PASS);
const canUseResend = Boolean(process.env.RESEND_API);

const canUseTwilio =
  Boolean(process.env.TWILIO_ACCOUNT_SID) &&
  Boolean(process.env.TWILIO_AUTH_TOKEN) &&
  Boolean(process.env.TWILIO_WHATSAPP_FROM);

let twilioClient = null;
if (canUseTwilio) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

const isLikelyObjectId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const pickOrderAddressCandidate = (order) => {
  if (!order) return null;

  if (order.delivery_address) {
    return order.delivery_address;
  }

  if (order.metadata?.guest_delivery_address) {
    return order.metadata.guest_delivery_address;
  }

  if (order.contact_info?.address_snapshot) {
    return order.contact_info.address_snapshot;
  }

  return null;
};

function normaliseWhatsAppPhone(phone) {
  if (!phone) return null;

  const sanitized = phone.replace(/[^\d+]/g, "");
  if (!sanitized) return null;

  if (sanitized.startsWith("+")) {
    return sanitized;
  }

  const defaultCode = process.env.DEFAULT_WHATSAPP_COUNTRY_CODE ?? "";
  if (defaultCode.startsWith("+")) {
    return `${defaultCode}${sanitized}`;
  }
  if (defaultCode) {
    return `+${defaultCode}${sanitized}`;
  }

  return null;
}

async function sendWhatsAppMessage({ to, body }) {
  if (!twilioClient) {
    console.info(
      "sendWhatsAppMessage: Twilio not configured, skipping WhatsApp notification."
    );
    return;
  }

  const recipient = normaliseWhatsAppPhone(to);
  if (!recipient) {
    console.warn(
      "sendWhatsAppMessage: invalid phone number, skipping WhatsApp notification."
    );
    return;
  }

  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${recipient}`,
      body,
    });
  } catch (error) {
    console.error("sendWhatsAppMessage: failed to send WhatsApp message", error);
  }
}

function withTimeout(promise, ms, label = "timeout") {
  let timer = null;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(label)), ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function sendWithNodemailer({
  recipients,
  subject,
  text,
  html,
  replyTo,
  fromName,
  fromEmail,
}) {
  if (!canUseNodemailer) {
    return { ok: false, skipped: true, reason: "Nodemailer not configured" };
  }

  try {
    await withTimeout(
      transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: recipients,
        subject,
        text,
        html,
        replyTo,
      }),
      MAIL_TIMEOUT_MS,
      "Nodemailer timeout"
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

async function sendWithResend({
  recipients,
  subject,
  text,
  html,
  replyTo,
  fromName,
}) {
  if (!canUseResend) {
    return { ok: false, skipped: true, reason: "Resend not configured" };
  }

  const resendFrom = `${fromName} <${RESEND_SENDER_EMAIL}>`;

  try {
    const resendResult = await sendEmail({
      sendTo: recipients,
      subject,
      html,
      text,
      replyTo,
      from: resendFrom,
    });

    if (resendResult?.success) {
      return { ok: true };
    }

    return { ok: false, error: resendResult?.error || "Resend failed" };
  } catch (error) {
    return { ok: false, error };
  }
}

async function sendEmailWithFallback({
  to,
  subject,
  text,
  html,
  replyTo,
  fromName,
  fromEmail,
}) {
  const recipients = Array.isArray(to)
    ? to.filter(Boolean)
    : [to].filter(Boolean);

  if (!recipients.length) {
    console.warn("sendEmailWithFallback: no recipients provided");
    return false;
  }

  const resolvedFromName = fromName ?? BRAND_NAME;
  const resolvedFromEmail = fromEmail ?? ADMIN_EMAIL;
  const plainText = text && text.trim().length ? text : undefined;
  const htmlBody =
    html ??
    (plainText
      ? `<pre style="white-space:pre-wrap">${plainText}</pre>`
      : undefined);

  const nodemailerResult = await sendWithNodemailer({
    recipients,
    subject,
    text: plainText,
    html: htmlBody,
    replyTo,
    fromName: resolvedFromName,
    fromEmail: resolvedFromEmail,
  });

  if (nodemailerResult.ok) {
    return true;
  }

  if (!nodemailerResult.skipped) {
    console.warn(
      "sendEmailWithFallback: Nodemailer failed, attempting Resend fallback."
    );
  }

  const resendResult = await sendWithResend({
    recipients,
    subject,
    text: plainText,
    html: htmlBody,
    replyTo,
    fromName: resolvedFromName,
  });

  if (resendResult.ok) {
    return true;
  }

  if (!resendResult.skipped) {
    console.error("sendEmailWithFallback: Resend failed", resendResult.error);
  }

  return false;
}

function formatProductsForEmail(products = []) {
  if (!Array.isArray(products) || !products.length) {
    return "No products listed.";
  }

  return products
    .map((prod, idx) => {
      const images = Array.isArray(prod.product_details?.image)
        ? prod.product_details.image.join(", ")
        : prod.product_details?.image ?? "N/A";

      return `#${idx + 1}
  Product: ${prod.product_details?.name ?? "N/A"}
  Qty: ${prod.quantity ?? 0}
  Price: ${prod.price ?? 0}
  Images: ${images}`.trim();
    })
    .join("\n\n");
}

function formatAddress(addressInput) {
  if (!addressInput) return "N/A";

  if (typeof addressInput === "string") {
    return addressInput;
  }

  const addressLine =
    addressInput.address_line ??
    addressInput.addressLine ??
    addressInput.street ??
    "";

  const cityState = [addressInput.city, addressInput.state]
    .filter(Boolean)
    .join(", ");

  const countryZip = [addressInput.country, addressInput.pincode]
    .filter(Boolean)
    .join(" ");

  const lines = [
    addressLine,
    cityState,
    countryZip,
    addressInput.landmark ? `Landmark: ${addressInput.landmark}` : null,
    addressInput.mobile ? `Mobile: ${addressInput.mobile}` : null,
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : "N/A";
}

async function resolveAddressObject(order) {
  let addressObj = pickOrderAddressCandidate(order);

  if (
    addressObj &&
    typeof addressObj === "string" &&
    isLikelyObjectId(addressObj)
  ) {
    try {
      addressObj = await AddressModel.findById(addressObj).lean();
    } catch (error) {
      console.error("resolveAddressObject: failed to look up address by id", error);
      addressObj = null;
    }
  }

  return addressObj;
}

async function resolveCustomerContact(order, addressObj) {
  const addressFallback =
    addressObj ??
    order?.metadata?.guest_delivery_address ??
    order?.contact_info?.address_snapshot ??
    null;

  let name =
    addressFallback?.name ??
    order?.contact_info?.name ??
    order?.customer?.name ??
    "Customer";

  let email =
    order?.contact_info?.customer_email ??
    order?.contact_info?.email ??
    addressFallback?.customer_email ??
    order?.customer?.email ??
    null;

  let phone =
    order?.contact_info?.mobile ??
    order?.contact_info?.phone ??
    addressFallback?.mobile ??
    order?.customer?.phone ??
    null;

  if (!email && order?.userId) {
    try {
      const user = await UserModel.findById(order.userId)
        .select("email name mobile phone")
        .lean();

      if (user) {
        email = user.email ?? email;
        name = name ?? user.name ?? "Customer";
        phone = phone ?? user.mobile ?? user.phone ?? null;
      }
    } catch (error) {
      console.error("resolveCustomerContact: user lookup failed", error);
    }
  }

  return { name, email, phone };
}

function formatOrderEmailForCustomer(order, addressObj) {
  const addressText = formatAddress(
    addressObj ??
      order?.metadata?.guest_delivery_address ??
      order?.contact_info?.address_snapshot
  );
  const paymentStatus =
    order?.payment_status ?? order?.paymentStatus ?? "Processing";
  const paymentMethod =
    order?.paymentMethod ??
    order?.payment_method ??
    (paymentStatus === "CASH ON DELIVERY" ? "Cash on Delivery" : "Online");

  return `
Order ID: ${order?.orderId ?? order?._id ?? "N/A"}
Payment Status: ${paymentStatus}
Payment Method: ${paymentMethod}

Products:
${formatProductsForEmail(order?.products)}

Total: ${order?.totalAmt ?? order?.subTotalAmt ?? 0}

Delivery Address:
${addressText}
`.trim();
}

export async function sendOrderNotificationToAdmin(orderArray = []) {
  if (!ADMIN_RECEIVE_EMAIL) {
    console.warn(
      "sendOrderNotificationToAdmin: ADMIN_RECEIVE_EMAIL is not set, skipping email notifications."
    );
    return;
  }

  for (const order of orderArray) {
    const addressObj = await resolveAddressObject(order);
    const addressText = formatAddress(addressObj);

    const customerName =
      addressObj?.name ??
      order.contact_info?.name ??
      order.metadata?.guest_delivery_address?.name ??
      "Customer";

    const customerEmail =
      order.contact_info?.customer_email ??
      addressObj?.customer_email ??
      order.metadata?.guest_delivery_address?.customer_email ??
      "N/A";

    const customerPhone =
      order.contact_info?.mobile ??
      addressObj?.mobile ??
      order.metadata?.guest_delivery_address?.mobile ??
      "N/A";

    const subject = `${
      order.is_guest ? "[GUEST] " : ""
    }New Order: ${order.orderId}`;
    const text = `
Order ID: ${order.orderId}
Products:
${formatProductsForEmail(order.products)}

Total: ${order.totalAmt ?? order.subTotalAmt ?? 0}
Customer Name: ${customerName}
Customer Email: ${customerEmail}
Customer Phone: ${customerPhone}
Customer Address:
${addressText}
${order.is_guest ? "GUEST ORDER: Yes" : ""}
`.trim();

    await sendEmailWithFallback({
      to: ADMIN_RECEIVE_EMAIL,
      subject,
      text,
      fromName: customerName,
      fromEmail: ADMIN_EMAIL,
      replyTo: customerEmail !== "N/A" ? customerEmail : undefined,
    });
  }
}

export async function sendOrderNotificationToCustomer(order) {
  if (!order) return;

  const addressObj = await resolveAddressObject(order);
  const { name, email, phone } = await resolveCustomerContact(order, addressObj);

  const subject = `Order Confirmation: ${order.orderId ?? order._id ?? ""}`;
  const body = `
Hi ${name},

Thank you for your order! We have received it successfully.

${formatOrderEmailForCustomer(order, addressObj)}

If you have any questions, please reply to this email.

Thank you for shopping with us!
`.trim();

  if (email) {
    await sendEmailWithFallback({
      to: email,
      subject,
      text: body,
      fromName: BRAND_NAME,
      fromEmail: ADMIN_EMAIL,
      replyTo: SUPPORT_EMAIL || undefined,
    });
  }

  if (phone) {
    const whatsappBody = `Hi ${name}, we received your order ${
      order.orderId ?? order._id ?? ""
    }. Total: ${order.totalAmt ?? order.subTotalAmt ?? 0}. Thank you for shopping with us!`;
    await sendWhatsAppMessage({ to: phone, body: whatsappBody });
  }
}

export async function sendPayunitPaymentNotification({
  orderId,
  transactionId,
  amount,
  currency = "XAF",
  status,
  channel,
  customerName,
  customerEmail,
  customerPhone,
} = {}) {
  const resolvedOrderId = orderId ?? transactionId ?? "N/A";
  const resolvedStatus = status ?? "UNKNOWN";
  const channelLabel = channel ?? "Payunit";

  const adminSubject = `Payment ${resolvedStatus}: ${resolvedOrderId}`;
  const adminBody = `
Payment Update (Payunit)

Order ID: ${resolvedOrderId}
Transaction ID: ${transactionId ?? "N/A"}
Status: ${resolvedStatus}
Channel: ${channelLabel}
Amount: ${amount ?? "N/A"} ${currency}

Customer Name: ${customerName ?? "N/A"}
Customer Email: ${customerEmail ?? "N/A"}
Customer Phone: ${customerPhone ?? "N/A"}
`.trim();

  if (ADMIN_RECEIVE_EMAIL) {
    await sendEmailWithFallback({
      to: ADMIN_RECEIVE_EMAIL,
      subject: adminSubject,
      text: adminBody,
      fromName: "Payments Robot",
      fromEmail: ADMIN_EMAIL,
    });
  }

  if (customerEmail) {
    const customerSubject = `Payment ${resolvedStatus}: ${resolvedOrderId}`;
    const customerBody = `
Hi ${customerName ?? "Customer"},

We have received your payment.

Order ID: ${resolvedOrderId}
Status: ${resolvedStatus}
Channel: ${channelLabel}
Amount: ${amount ?? "N/A"} ${currency}

Thank you for shopping with us!
`.trim();

    await sendEmailWithFallback({
      to: customerEmail,
      subject: customerSubject,
      text: customerBody,
      fromName: BRAND_NAME,
      fromEmail: ADMIN_EMAIL,
      replyTo: SUPPORT_EMAIL || undefined,
    });
  }

  if (customerPhone) {
    const whatsappBody = `Hi ${customerName ?? "Customer"}, your payment (${resolvedStatus}) for order ${resolvedOrderId} was received. Amount: ${amount ?? "N/A"} ${currency}. Thank you!`;
    await sendWhatsAppMessage({ to: customerPhone, body: whatsappBody });
  }
}

export async function sendDeliveryConfirmationNotification(order) {
  if (!order) return;

  const addressObj = await resolveAddressObject(order);
  const customerEmail =
    order.contact_info?.customer_email ??
    addressObj?.customer_email ??
    null;
  const customerPhone =
    order.contact_info?.mobile ??
    addressObj?.mobile ??
    null;
  const customerName =
    order.contact_info?.name ??
    addressObj?.name ??
    "Valued Customer";
  const orderId = order.orderId ?? order._id;

  const emailSubject = `Delivery Confirmation: ${orderId}`;
  const emailBody = `
Hi ${customerName},

Great news! Your order ${orderId} has been successfully delivered.

If you have any questions or concerns, simply reply to this email or contact support.

Thank you for shopping with us!
`.trim();

  if (customerEmail) {
    await sendEmailWithFallback({
      to: customerEmail,
      subject: emailSubject,
      text: emailBody,
      fromName: BRAND_NAME,
      fromEmail: ADMIN_EMAIL,
      replyTo: SUPPORT_EMAIL || undefined,
    });
  }

  if (customerPhone) {
    const whatsappBody = `Hi ${customerName}, your order ${orderId} has just been delivered. Thank you for shopping with us!`;
    await sendWhatsAppMessage({ to: customerPhone, body: whatsappBody });
  }
}