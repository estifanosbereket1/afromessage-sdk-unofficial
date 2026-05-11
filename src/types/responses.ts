type ApiStatus = "Success" | "Fail";

interface BaseResponse {
  acknowledge: ApiStatus;
}

export interface SendSmsSuccess extends BaseResponse {
  acknowledge: "Success";
  response: string;
}

export interface SendSmsFail extends BaseResponse {
  acknowledge: "Fail";
  response: string;
}

export type SendSmsResponse = SendSmsSuccess | SendSmsFail;

export interface OtpChallengeSuccess extends BaseResponse {
  acknowledge: "Success";
  response: {
    verificationId: string;
  };
}

export interface OtpChallengeFail extends BaseResponse {
  acknowledge: "Fail";
  response: string;
}

export type OtpChallengeResponse = OtpChallengeSuccess | OtpChallengeFail;

export interface OtpVerifySuccess extends BaseResponse {
  acknowledge: "Success";
  response: "Verified" | "Not Verified";
}

export interface OtpVerifyFail extends BaseResponse {
  acknowledge: "Fail";
  response: string;
}

export type OtpVerifyResponse = OtpVerifySuccess | OtpVerifyFail;
