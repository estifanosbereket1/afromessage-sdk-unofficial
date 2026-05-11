import { request, type RequestOptions } from "./utils/http.js";
import { SmsModule } from "./modules/sms.js";
import { OtpModule } from "./modules/otp.js";

export interface AfroMessageConfig {
  apiKey: string;
  baseUrl?: string;
  retries?: number;
}

export class AfroMessageClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly retries: number;

  readonly sms: SmsModule;
  readonly otp: OtpModule;

  constructor(config: AfroMessageConfig) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error("AfroMessage: apiKey is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.afromessage.com";
    this.retries = config.retries ?? 3;

    this.sms = new SmsModule(this.sendRequest.bind(this));
    this.otp = new OtpModule(this.sendRequest.bind(this));
  }

  private async sendRequest<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    return request<T>(
      this.baseUrl,
      path,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...options.headers,
        },
      },
      this.retries,
    );
  }
}
