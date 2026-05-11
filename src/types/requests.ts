export type HttpMethod = "GET" | "POST";

export interface SendSmsRequest {
  to: string;
  message: string;
  from?: string;
  sender?: string;
  template?: number;
  callback?: string;
  method?: HttpMethod;
}

export interface BulkSmsRequest {
  to: string[];
  message: string;
  from?: string;
  sender?: string;
  callback?: string;
}

export interface PersonalizedSmsRequest {
  recipients: Array<{ to: string; message: string }>;
  from?: string;
  sender?: string;
  callback?: string;
}

export type OtpType = "numeric" | "alphanumeric" | "alphabet";

export interface OtpChallengeRequest {
  to: string;
  from?: string;
  sender?: string;
  codeLength?: number;
  type?: OtpType;
  ttl?: number;
  prefix?: string;
  postfix?: string;
  callback?: string;
}

export interface OtpVerifyRequest {
  to: string;
  code: string;
}
