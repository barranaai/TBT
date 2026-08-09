const META_PIXEL_ID = "1571342728047194";
const DEFAULT_GRAPH_API_VERSION = "v24.0";

type MetaLeadInput = {
  clientIp: string;
  eventId: string;
  eventSourceUrl: string;
  fbc: string;
  fbp: string;
  userAgent: string;
};

export type MetaLeadResult = {
  accepted: boolean;
  configured: boolean;
  status?: number;
};

function graphApiVersion(): string {
  const value = process.env.META_GRAPH_API_VERSION || "";
  return /^v\d+\.\d+$/.test(value) ? value : DEFAULT_GRAPH_API_VERSION;
}

function safeEventSourceUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl || "https://teethbytrev.com/");
    if (
      parsed.hostname === "teethbytrev.com" ||
      parsed.hostname.endsWith(".airoapp.ai") ||
      parsed.hostname === "localhost"
    ) {
      // Keep query strings, form branches and treatment-related paths out of
      // Meta. The root domain is sufficient to identify the website source.
      return `${parsed.protocol}//${parsed.host}/`;
    }
  } catch {
    // Fall through to the public production origin.
  }
  return "https://teethbytrev.com/";
}

export async function sendMetaLead(
  input: MetaLeadInput,
): Promise<MetaLeadResult> {
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) return { accepted: false, configured: false };

  const userData: Record<string, string> = {};
  if (input.clientIp) userData.client_ip_address = input.clientIp;
  if (input.userAgent) userData.client_user_agent = input.userAgent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  if (!Object.keys(userData).length) {
    return { accepted: false, configured: true };
  }

  const body: {
    data: Array<Record<string, unknown>>;
    test_event_code?: string;
  } = {
    data: [
      {
        action_source: "website",
        event_id: input.eventId,
        event_name: "Lead",
        event_source_url: safeEventSourceUrl(input.eventSourceUrl),
        event_time: Math.floor(Date.now() / 1000),
        user_data: userData,
      },
    ],
  };

  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;
  if (testEventCode) body.test_event_code = testEventCode;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphApiVersion()}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
        method: "POST",
        signal: controller.signal,
      },
    );
    return {
      accepted: response.ok,
      configured: true,
      status: response.status,
    };
  } catch (error) {
    console.error(
      "[meta-capi] Lead event delivery failed",
      error instanceof Error ? error.name : "unknown_error",
    );
    return { accepted: false, configured: true };
  } finally {
    clearTimeout(timeout);
  }
}
