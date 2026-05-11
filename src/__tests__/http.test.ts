import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { request } from "../utils/http.js";
import {
  AfroAuthError,
  AfroRateLimitError,
  AfroMessageError,
} from "../types/errors.js";
import { server, BASE_URL } from "./mocks.js";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("request()", () => {
  it("returns parsed JSON on success", async () => {
    const result = await request<{ acknowledge: string }>(
      BASE_URL,
      "/api/send",
      { params: { to: "+251912345678", message: "hi" } },
    );
    expect(result.acknowledge).toBe("Success");
  });

  it("throws AfroAuthError on 401", async () => {
    server.use(
      http.get(`${BASE_URL}/api/send`, () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
      }),
    );

    await expect(request(BASE_URL, "/api/send", {})).rejects.toBeInstanceOf(
      AfroAuthError,
    );
  });

  it("throws AfroRateLimitError on 429", async () => {
    server.use(
      http.get(`${BASE_URL}/api/send`, () => {
        return HttpResponse.json(
          { error: "Too many requests" },
          { status: 429 },
        );
      }),
    );

    await expect(request(BASE_URL, "/api/send", {}, 1)).rejects.toBeInstanceOf(
      AfroRateLimitError,
    );
  });

  it("throws AfroMessageError on 500", async () => {
    server.use(
      http.get(`${BASE_URL}/api/send`, () => {
        return HttpResponse.json({ error: "Server error" }, { status: 500 });
      }),
    );

    await expect(request(BASE_URL, "/api/send", {}, 1)).rejects.toBeInstanceOf(
      AfroMessageError,
    );
  });

  it("throws AfroMessageError on non-JSON response", async () => {
    server.use(
      http.get(`${BASE_URL}/api/send`, () => {
        return new HttpResponse("not json", { status: 200 });
      }),
    );

    await expect(request(BASE_URL, "/api/send", {})).rejects.toBeInstanceOf(
      AfroMessageError,
    );
  });

  it("builds query params correctly", async () => {
    let capturedUrl: string | null = null;

    server.use(
      http.get(`${BASE_URL}/api/send`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ acknowledge: "Success", response: "ok" });
      }),
    );

    await request(BASE_URL, "/api/send", {
      params: { to: "+251912345678", message: "hello", from: undefined },
    });

    const url = new URL(capturedUrl!);
    expect(url.searchParams.get("to")).toBe("+251912345678");
    expect(url.searchParams.get("message")).toBe("hello");
    expect(url.searchParams.has("from")).toBe(false);
  });
});
