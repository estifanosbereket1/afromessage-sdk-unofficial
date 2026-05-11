import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { AfroMessageClient } from "../client.js";
import { AfroValidationError } from "../types/errors.js";
import { server, BASE_URL } from "./mocks.js";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = new AfroMessageClient({
  apiKey: "test-api-key",
  baseUrl: BASE_URL,
});

describe("sms.send()", () => {
  it("returns a success response", async () => {
    const result = await client.sms.send({
      to: "+251912345678",
      message: "Hello Estifanos",
    });

    expect(result.acknowledge).toBe("Success");

    if (result.acknowledge === "success") {
      expect(result.response).toBe("msg-id-123");
    }
  });

  it("throws AfroValidationError for invalid phone number", async () => {
    await expect(
      client.sms.send({ to: "0912345678", message: "Hello" }),
    ).rejects.toBeInstanceOf(AfroValidationError);
  });

  it("throws AfroValidationError for empty message", async () => {
    await expect(
      client.sms.send({ to: "+251912345678", message: "   " }),
    ).rejects.toBeInstanceOf(AfroValidationError);
  });

  it("attaches Authorization header", async () => {
    let capturedAuth: string | null = null;

    server.use(
      http.get(`${BASE_URL}/api/send`, ({ request }) => {
        capturedAuth = request.headers.get("Authorization");
        return HttpResponse.json({ acknowledge: "Success", response: "ok" });
      }),
    );

    await client.sms.send({ to: "+251912345678", message: "Hello" });
    expect(capturedAuth).toBe("Bearer test-api-key");
  });
});

describe("sms.bulk()", () => {
  it("handles uniform bulk SMS", async () => {
    const result = await client.sms.bulk({
      to: ["+251912345678", "+251987654321"],
      message: "Broadcast message",
    });
    expect(result.acknowledge).toBe("Success");
  });

  it("handles personalized bulk SMS", async () => {
    const result = await client.sms.bulk({
      recipients: [
        { to: "+251912345678", message: "Hi Estifanos" },
        { to: "+251987654321", message: "Hi Abebe" },
      ],
    });
    expect(result.acknowledge).toBe("Success");
  });

  it("throws AfroValidationError if any phone in bulk is invalid", async () => {
    await expect(
      client.sms.bulk({
        to: ["+251912345678", "not-a-phone"],
        message: "Hello",
      }),
    ).rejects.toBeInstanceOf(AfroValidationError);
  });
});
