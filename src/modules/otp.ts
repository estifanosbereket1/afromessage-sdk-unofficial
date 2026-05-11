import type { RequestOptions } from "../utils/http.js";
import { validatePhone } from "../utils/validation.js";
import type {
  OtpChallengeRequest,
  OtpVerifyRequest,
} from "../types/requests.js";
import type {
  OtpChallengeResponse,
  OtpVerifyResponse,
} from "../types/responses.js";

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

export class OtpModule {
  constructor(private readonly request: Requester) {}

  async challenge(params: OtpChallengeRequest): Promise<OtpChallengeResponse> {
    validatePhone(params.to);

    return this.request<OtpChallengeResponse>("/api/challenge", {
      params: {
        to: params.to,
        from: params.from,
        sender: params.sender,
        len: params.codeLength,
        t:
          params.type === "numeric"
            ? 0
            : params.type === "alphanumeric"
              ? 1
              : params.type === "alphabet"
                ? 2
                : undefined,
        ttl: params.ttl,
        pr: params.prefix,
        ps: params.postfix,
        callback: params.callback,
      },
    });
  }

  async verify(params: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    validatePhone(params.to);

    return this.request<OtpVerifyResponse>("/api/verify", {
      params: {
        to: params.to,
        code: params.code,
      },
    });
  }
}
