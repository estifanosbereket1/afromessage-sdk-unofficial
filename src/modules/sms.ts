import type { RequestOptions } from "../utils/http.js";
import { validatePhone, assertNonEmpty } from "../utils/validation.js";
import type {
  SendSmsRequest,
  BulkSmsRequest,
  PersonalizedSmsRequest,
} from "../types/requests.js";
import type { SendSmsResponse } from "../types/responses.js";

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

export class SmsModule {
  constructor(private readonly request: Requester) {}

  async send(params: SendSmsRequest): Promise<SendSmsResponse> {
    assertNonEmpty(params.to, "to");
    validatePhone(params.to);
    assertNonEmpty(params.message, "message");

    return this.request<SendSmsResponse>("/api/send", {
      method: params.method ?? "GET",
      params: {
        to: params.to,
        message: params.message,
        from: params.from,
        sender: params.sender,
        template: params.template,
        callback: params.callback,
      },
    });
  }

  async bulk(params: BulkSmsRequest): Promise<SendSmsResponse>;
  async bulk(params: PersonalizedSmsRequest): Promise<SendSmsResponse>;
  async bulk(
    params: BulkSmsRequest | PersonalizedSmsRequest,
  ): Promise<SendSmsResponse> {
    if ("recipients" in params) {
      for (const r of params.recipients) {
        validatePhone(r.to);
        assertNonEmpty(r.message, "message");
      }

      return this.request<SendSmsResponse>("/api/send", {
        method: "POST",
        body: {
          from: params.from,
          sender: params.sender,
          callback: params.callback,
          recipients: params.recipients,
        },
      });
    }

    for (const phone of params.to) {
      validatePhone(phone);
    }
    assertNonEmpty(params.message, "message");

    return this.request<SendSmsResponse>("/api/send", {
      method: "POST",
      body: {
        from: params.from,
        sender: params.sender,
        callback: params.callback,
        to: params.to,
        message: params.message,
      },
    });
  }
}
