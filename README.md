# afromessage-ts

> **Note:** This is an unofficial, community-maintained TypeScript SDK for the [AfroMessage](https://afromessage.com) API. It is not formally affiliated with or endorsed by [AfroMessage](https://afromessage.com).

## Installation

```bash
# npm
npm install afromessage-unofficial-ts


# pnpm
pnpm install afromessage-unofficial-ts

```

## Quick start

```ts
import { AfroMessageClient } from "afromessage-ts";

const afro = new AfroMessageClient({
  apiKey: process.env.AFRO_API_KEY!,
});

// Send SMS
const result = await afro.sms.send({
  to: "+251912345678",
  message: "Hello from AfroMessage!",
});

if (result.acknowledge === "Success") {
  console.log("Sent:", result.response);
}

// Send OTP
const { acknowledge, response } = await afro.otp.challenge({
  to: "+251912345678",
  codeLength: 6,
  ttl: 300,
});

// Verify OTP
const verification = await afro.otp.verify({
  to: "+251912345678",
  code: userInputCode,
});

if (verification.acknowledge === "Success") {
  const verified = verification.response === "Verified";
}
```

## Error handling

```ts
import {
  AfroAuthError,
  AfroRateLimitError,
  AfroValidationError,
  AfroMessageError,
} from "afromessage-ts";

try {
  await afro.sms.send({ to: "+251912345678", message: "Hi" });
} catch (err) {
  if (err instanceof AfroValidationError) {
    // bad input — fix before retrying
  } else if (err instanceof AfroAuthError) {
    // invalid API key
  } else if (err instanceof AfroRateLimitError) {
    // slow down
  } else if (err instanceof AfroMessageError) {
    console.error(err.statusCode, err.raw);
  }
}
```

## Configuration

| Option    | Type     | Default                       | Description              |
| --------- | -------- | ----------------------------- | ------------------------ |
| `apiKey`  | `string` | **required**                  | Your AfroMessage API key |
| `baseUrl` | `string` | `https://api.afromessage.com` | Override for testing     |
| `retries` | `number` | `3`                           | Max retries on 429/5xx   |
