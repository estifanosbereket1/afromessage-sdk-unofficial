interface RequestOptions {
    method?: "GET" | "POST";
    params?: Record<string, string | number | boolean | undefined>;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
}

type HttpMethod = "GET" | "POST";
interface SendSmsRequest {
    to: string;
    message: string;
    from?: string;
    sender?: string;
    template?: number;
    callback?: string;
    method?: HttpMethod;
}
interface BulkSmsRequest {
    to: string[];
    message: string;
    from?: string;
    sender?: string;
    callback?: string;
}
interface PersonalizedSmsRequest {
    recipients: Array<{
        to: string;
        message: string;
    }>;
    from?: string;
    sender?: string;
    callback?: string;
}
type OtpType = "numeric" | "alphanumeric" | "alphabet";
interface OtpChallengeRequest {
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
interface OtpVerifyRequest {
    to: string;
    code: string;
}

type ApiStatus = "success" | "fail";
interface BaseResponse {
    acknowledge: ApiStatus;
}
interface SendSmsSuccessData {
    status: string;
    message_id: string;
    message: string;
    to: string;
}
interface SendSmsSuccess extends BaseResponse {
    acknowledge: "success";
    response: SendSmsSuccessData;
}
interface SendSmsFail extends BaseResponse {
    acknowledge: "fail";
    response: string;
}
type SendSmsResponse = SendSmsSuccess | SendSmsFail;
interface OtpChallengeSuccess extends BaseResponse {
    acknowledge: "success";
    response: {
        verificationId: string;
    };
}
interface OtpChallengeFail extends BaseResponse {
    acknowledge: "fail";
    response: string;
}
type OtpChallengeResponse = OtpChallengeSuccess | OtpChallengeFail;
interface OtpVerifySuccess extends BaseResponse {
    acknowledge: "success";
    response: "Verified" | "Not Verified";
}
interface OtpVerifyFail extends BaseResponse {
    acknowledge: "fail";
    response: string;
}
type OtpVerifyResponse = OtpVerifySuccess | OtpVerifyFail;

type Requester$1 = <T>(path: string, options?: RequestOptions) => Promise<T>;
declare class SmsModule {
    private readonly request;
    constructor(request: Requester$1);
    send(params: SendSmsRequest): Promise<SendSmsResponse>;
    bulk(params: BulkSmsRequest): Promise<SendSmsResponse>;
    bulk(params: PersonalizedSmsRequest): Promise<SendSmsResponse>;
}

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;
declare class OtpModule {
    private readonly request;
    constructor(request: Requester);
    challenge(params: OtpChallengeRequest): Promise<OtpChallengeResponse>;
    verify(params: OtpVerifyRequest): Promise<OtpVerifyResponse>;
}

interface AfroMessageConfig {
    apiKey: string;
    baseUrl?: string;
    retries?: number;
}
declare class AfroMessageClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly retries;
    readonly sms: SmsModule;
    readonly otp: OtpModule;
    constructor(config: AfroMessageConfig);
    private sendRequest;
}

declare class AfroMessageError extends Error {
    readonly statusCode: number;
    readonly raw: unknown;
    constructor(message: string, statusCode: number, raw: unknown);
}
declare class AfroAuthError extends AfroMessageError {
    constructor(raw: unknown);
}
declare class AfroRateLimitError extends AfroMessageError {
    constructor(raw: unknown);
}
declare class AfroValidationError extends AfroMessageError {
    constructor(message: string);
}

export { AfroAuthError, AfroMessageClient, type AfroMessageConfig, AfroMessageError, AfroRateLimitError, AfroValidationError, type BulkSmsRequest, type HttpMethod, type OtpChallengeFail, type OtpChallengeRequest, type OtpChallengeResponse, type OtpChallengeSuccess, type OtpType, type OtpVerifyFail, type OtpVerifyRequest, type OtpVerifyResponse, type OtpVerifySuccess, type PersonalizedSmsRequest, type SendSmsFail, type SendSmsRequest, type SendSmsResponse, type SendSmsSuccess };
