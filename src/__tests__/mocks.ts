import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const BASE_URL = "https://api.afromessage.com";

export const handlers = [
  http.get(`${BASE_URL}/api/send`, () => {
    return HttpResponse.json({
      acknowledge: "success",
      response: "msg-id-123",
    });
  }),

  http.post(`${BASE_URL}/api/send`, () => {
    return HttpResponse.json({
      acknowledge: "success",
      response: "msg-id-bulk-456",
    });
  }),

  http.get(`${BASE_URL}/api/challenge`, () => {
    return HttpResponse.json({
      acknowledge: "success",
      response: { verificationId: "ver-id-789" },
    });
  }),

  http.get(`${BASE_URL}/api/verify`, () => {
    return HttpResponse.json({
      acknowledge: "success",
      response: "Verified",
    });
  }),
];

export const server = setupServer(...handlers);
