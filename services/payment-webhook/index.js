var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// services/payment-webhook/index.ts
var index_exports = {};
__export(index_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(index_exports);
var import_crypto = require("crypto");
var import_client_eventbridge = require("@aws-sdk/client-eventbridge");
var import_client_dynamodb = require("@aws-sdk/client-dynamodb");
var import_lib_dynamodb = require("@aws-sdk/lib-dynamodb");
var eventBridge = new import_client_eventbridge.EventBridgeClient({});
var eventBusName = process.env.EVENT_BUS_NAME;
var stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
var stripeSignatureToleranceSeconds = 300;
var tableName = process.env.TABLE_NAME || "";
var ddbClient = new import_client_dynamodb.DynamoDBClient({});
var ddbDocClient = import_lib_dynamodb.DynamoDBDocumentClient.from(ddbClient);
var jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  body: JSON.stringify(body)
});
var getRawBody = (body, isBase64Encoded) => isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
var parseStripeSignatureHeader = (header) => header.split(",").reduce(
  (parts, segment) => {
    const [key, ...valueParts] = segment.split("=");
    const value = valueParts.join("=");
    if (key === "t") {
      parts.timestamp = value;
    }
    if (key === "v1" && value) {
      parts.signatures.push(value);
    }
    return parts;
  },
  { timestamp: void 0, signatures: [] }
);
var safeHexEqual = (expectedHex, actualHex) => {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");
  return expected.length === actual.length && (0, import_crypto.timingSafeEqual)(expected, actual);
};
var verifyStripeSignature = (rawBody, signatureHeader, webhookSecret) => {
  const { timestamp, signatures } = parseStripeSignatureHeader(signatureHeader);
  if (!timestamp || signatures.length === 0) {
    return false;
  }
  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }
  const ageSeconds = Math.abs(Date.now() / 1e3 - timestampSeconds);
  if (ageSeconds > stripeSignatureToleranceSeconds) {
    return false;
  }
  const signedPayload = `${timestamp}.${rawBody}`;
  const expectedSignature = (0, import_crypto.createHmac)("sha256", webhookSecret).update(signedPayload, "utf8").digest("hex");
  return signatures.some(
    (signature) => safeHexEqual(expectedSignature, signature)
  );
};
var handler = async (event) => {
  try {
    if (!eventBusName) {
      throw new Error("EVENT_BUS_NAME environment variable is not set");
    }
    if (!stripeWebhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
    }
    if (event.httpMethod !== "POST") {
      return jsonResponse(405, { message: "Method Not Allowed" });
    }
    if (event.path !== "/webhooks/stripe") {
      return jsonResponse(404, { message: "Route not found" });
    }
    const signature = event.headers["stripe-signature"] ?? event.headers["Stripe-Signature"];
    if (!signature) {
      return jsonResponse(400, { message: "Missing Stripe signature" });
    }
    if (!event.body) {
      return jsonResponse(400, { message: "Missing webhook body" });
    }
    const rawBody = getRawBody(event.body, event.isBase64Encoded);
    if (!verifyStripeSignature(rawBody, signature, stripeWebhookSecret)) {
      return jsonResponse(400, { message: "Invalid Stripe signature" });
    }
    const payload = JSON.parse(rawBody);
    if (payload.type !== "checkout.session.completed") {
      return jsonResponse(200, { received: true, ignored: true });
    }
    const orderInfo = payload.data?.object ?? payload;
    const orderId = orderInfo.metadata?.orderId || orderInfo.client_reference_id;
    if (orderId && tableName) {
      try {
        console.log(`Releasing inventory reservation for order: ${orderId}`);
        const getOrderResult = await ddbDocClient.send(
          new import_lib_dynamodb.GetCommand({
            TableName: tableName,
            Key: {
              PK: `ORDER#${orderId}`,
              SK: "METADATA"
            }
          })
        );
        const order = getOrderResult.Item;
        if (order && Array.isArray(order.items)) {
          for (const item of order.items) {
            const productId = String(item.productId);
            const qty = item.quantity || 1;
            console.log(`Deducting reserved count for product ${productId} by ${qty}`);
            await ddbDocClient.send(
              new import_lib_dynamodb.UpdateCommand({
                TableName: tableName,
                Key: {
                  PK: `PRODUCT#${productId}`,
                  SK: "INVENTORY"
                },
                UpdateExpression: "SET reserved = reserved - :qty",
                ExpressionAttributeValues: {
                  ":qty": qty
                }
              })
            );
          }
        } else {
          console.warn(`Order ${orderId} not found in DB or has no items. Skipping reservation release.`);
        }
      } catch (err) {
        console.error(`Failed to release inventory reservation for order ${orderId}:`, err);
      }
    }
    const result = await eventBridge.send(
      new import_client_eventbridge.PutEventsCommand({
        Entries: [
          {
            EventBusName: eventBusName,
            Source: "com.musicstore.payment",
            DetailType: "PaymentSucceeded",
            Detail: JSON.stringify(orderInfo)
          }
        ]
      })
    );
    const failedEntryCount = result.FailedEntryCount ?? 0;
    if (failedEntryCount > 0) {
      throw new Error(
        `EventBridge PutEvents failed for ${failedEntryCount} entr${failedEntryCount === 1 ? "y" : "ies"}`
      );
    }
    return jsonResponse(200, { received: true });
  } catch (error) {
    console.error("Payment webhook handler failed", {
      error,
      requestId: event.requestContext.requestId,
      path: event.path,
      method: event.httpMethod
    });
    return jsonResponse(500, { message: "Internal Server Error" });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
