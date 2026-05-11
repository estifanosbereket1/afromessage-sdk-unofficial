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

describe("otp.challenge()", () => {
  it("returns a verificationId on success", async () => {
    const result = await client.otp.challenge({ to: "+251912345678" });

    expect(result.acknowledge).toBe("Success");

    if (result.acknowledge === "success") {
      expect(result.response.verificationId).toBe("ver-id-789");
    }
  });

  it("throws AfroValidationError for invalid phone", async () => {
    await expect(
      client.otp.challenge({ to: "bad-number" }),
    ).rejects.toBeInstanceOf(AfroValidationError);
  });

  it("returns Fail response when API signals failure", async () => {
    server.use(
      http.get(`${BASE_URL}/api/challenge`, () => {
        return HttpResponse.json({
          acknowledge: "Fail",
          response: "Sender not found",
        });
      }),
    );

    const result = await client.otp.challenge({ to: "+251912345678" });
    expect(result.acknowledge).toBe("Fail");
  });
});

describe("otp.verify()", () => {
  it("returns Verified on correct code", async () => {
    const result = await client.otp.verify({
      to: "+251912345678",
      code: "1234",
    });

    expect(result.acknowledge).toBe("Success");

    if (result.acknowledge === "success") {
      expect(result.response).toBe("Verified");
    }
  });

  it("returns Not Verified on wrong code", async () => {
    server.use(
      http.get(`${BASE_URL}/api/verify`, () => {
        return HttpResponse.json({
          acknowledge: "Success",
          response: "Not Verified",
        });
      }),
    );

    const result = await client.otp.verify({
      to: "+251912345678",
      code: "9999",
    });

    if (result.acknowledge === "success") {
      expect(result.response).toBe("Not Verified");
    }
  });

  it("throws AfroValidationError for invalid phone", async () => {
    await expect(
      client.otp.verify({ to: "0912", code: "1234" }),
    ).rejects.toBeInstanceOf(AfroValidationError);
  });
});
