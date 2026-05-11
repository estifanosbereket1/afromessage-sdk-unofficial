export { AfroMessageClient } from "./client.js";
export type { AfroMessageConfig } from "./client.js";

export type {
  SendSmsRequest,
  BulkSmsRequest,
  PersonalizedSmsRequest,
  OtpChallengeRequest,
  OtpVerifyRequest,
  OtpType,
  HttpMethod,
} from "./types/requests.js";

export type {
  SendSmsResponse,
  SendSmsSuccess,
  SendSmsFail,
  OtpChallengeResponse,
  OtpChallengeSuccess,
  OtpChallengeFail,
  OtpVerifyResponse,
  OtpVerifySuccess,
  OtpVerifyFail,
} from "./types/responses.js";

export {
  AfroMessageError,
  AfroAuthError,
  AfroRateLimitError,
  AfroValidationError,
} from "./types/errors.js";
