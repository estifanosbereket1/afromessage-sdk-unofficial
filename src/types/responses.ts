type ApiStatus = "success" | "fail";

interface BaseResponse {
  acknowledge: ApiStatus;
}

export interface SendSmsSuccessData {
  status: string;
  message_id: string;
  message: string;
  to: string;
}

export interface SendSmsSuccess extends BaseResponse {
  acknowledge: "success";
  response: SendSmsSuccessData;
}

export interface SendSmsFail extends BaseResponse {
  acknowledge: "fail";
  response: string;
}

export type SendSmsResponse = SendSmsSuccess | SendSmsFail;

export interface OtpChallengeSuccess extends BaseResponse {
  acknowledge: "success";
  response: {
    verificationId: string;
  };
}

export interface OtpChallengeFail extends BaseResponse {
  acknowledge: "fail";
  response: string;
}

export type OtpChallengeResponse = OtpChallengeSuccess | OtpChallengeFail;

export interface OtpVerifySuccess extends BaseResponse {
  acknowledge: "success";
  response: "Verified" | "Not Verified";
}

export interface OtpVerifyFail extends BaseResponse {
  acknowledge: "fail";
  response: string;
}

export type OtpVerifyResponse = OtpVerifySuccess | OtpVerifyFail;
