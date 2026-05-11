// src/types/errors.ts
var AfroMessageError = class extends Error {
  constructor(message, statusCode, raw) {
    super(message);
    this.statusCode = statusCode;
    this.raw = raw;
    this.name = "AfroMessageError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var AfroAuthError = class extends AfroMessageError {
  constructor(raw) {
    super("Invalid or missing API key", 401, raw);
    this.name = "AfroAuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var AfroRateLimitError = class extends AfroMessageError {
  constructor(raw) {
    super("Rate limit exceeded", 429, raw);
    this.name = "AfroRateLimitError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};
var AfroValidationError = class extends AfroMessageError {
  constructor(message) {
    super(message, 400, null);
    this.name = "AfroValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
};

// src/utils/http.ts
async function parseResponse(res) {
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new AfroMessageError(
      `Non-JSON response from server: ${text}`,
      res.status,
      text
    );
  }
  if (res.status === 401) throw new AfroAuthError(parsed);
  if (res.status === 429) throw new AfroRateLimitError(parsed);
  if (!res.ok) {
    throw new AfroMessageError(
      `Request failed with status ${res.status}`,
      res.status,
      parsed
    );
  }
  return parsed;
}
function buildUrl(base, path, params) {
  const url = new URL(path, base);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== void 0) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}
async function request(baseUrl, path, options = {}, retries = 3) {
  const { method = "GET", params, body, headers = {} } = options;
  const url = buildUrl(baseUrl, path, params);
  const init = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };
  if (body && method === "POST") {
    init.body = JSON.stringify(body);
  }
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 && attempt < retries - 1) {
        await sleep(exponentialDelay(attempt));
        continue;
      }
      return await parseResponse(res);
    } catch (err) {
      if (err instanceof AfroAuthError) throw err;
      lastError = err;
      if (attempt < retries - 1) {
        await sleep(exponentialDelay(attempt));
      }
    }
  }
  throw lastError;
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function exponentialDelay(attempt) {
  return Math.min(1e3 * 2 ** attempt, 1e4);
}

// src/utils/validation.ts
var E164_REGEX = /^\+[1-9]\d{1,14}$/;
function validatePhone(phone) {
  if (!E164_REGEX.test(phone)) {
    throw new AfroValidationError(
      `Invalid phone number "${phone}". Expected E.164 format e.g. +251912345678`
    );
  }
}
function assertNonEmpty(value, fieldName) {
  if (value.trim().length === 0) {
    throw new AfroValidationError(`"${fieldName}" must not be empty`);
  }
}

// src/modules/sms.ts
var SmsModule = class {
  constructor(request2) {
    this.request = request2;
  }
  async send(params) {
    assertNonEmpty(params.to, "to");
    validatePhone(params.to);
    assertNonEmpty(params.message, "message");
    return this.request("/api/send", {
      method: params.method ?? "GET",
      params: {
        to: params.to,
        message: params.message,
        from: params.from,
        sender: params.sender,
        template: params.template,
        callback: params.callback
      }
    });
  }
  async bulk(params) {
    if ("recipients" in params) {
      for (const r of params.recipients) {
        validatePhone(r.to);
        assertNonEmpty(r.message, "message");
      }
      return this.request("/api/send", {
        method: "POST",
        body: {
          from: params.from,
          sender: params.sender,
          callback: params.callback,
          recipients: params.recipients
        }
      });
    }
    for (const phone of params.to) {
      validatePhone(phone);
    }
    assertNonEmpty(params.message, "message");
    return this.request("/api/send", {
      method: "POST",
      body: {
        from: params.from,
        sender: params.sender,
        callback: params.callback,
        to: params.to,
        message: params.message
      }
    });
  }
};

// src/modules/otp.ts
var OtpModule = class {
  constructor(request2) {
    this.request = request2;
  }
  async challenge(params) {
    validatePhone(params.to);
    return this.request("/api/challenge", {
      params: {
        to: params.to,
        from: params.from,
        sender: params.sender,
        len: params.codeLength,
        t: params.type === "numeric" ? 0 : params.type === "alphanumeric" ? 1 : params.type === "alphabet" ? 2 : void 0,
        ttl: params.ttl,
        pr: params.prefix,
        ps: params.postfix,
        callback: params.callback
      }
    });
  }
  async verify(params) {
    validatePhone(params.to);
    return this.request("/api/verify", {
      params: {
        to: params.to,
        code: params.code
      }
    });
  }
};

// src/client.ts
var AfroMessageClient = class {
  constructor(config) {
    if (!config.apiKey || config.apiKey.trim().length === 0) {
      throw new Error("AfroMessage: apiKey is required");
    }
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? "https://api.afromessage.com";
    this.retries = config.retries ?? 3;
    this.sms = new SmsModule(this.sendRequest.bind(this));
    this.otp = new OtpModule(this.sendRequest.bind(this));
  }
  async sendRequest(path, options = {}) {
    return request(
      this.baseUrl,
      path,
      {
        ...options,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...options.headers
        }
      },
      this.retries
    );
  }
};
export {
  AfroAuthError,
  AfroMessageClient,
  AfroMessageError,
  AfroRateLimitError,
  AfroValidationError
};
//# sourceMappingURL=index.mjs.map