import type { ApiEditResponse, ApiQueryResponse, QueryPage } from "types-mediawiki-response";

/**
 * Minimal typed MediaWiki bot client. Pass a response type as the generic
 * argument of {@link Bot.request} and every field access below is checked
 * against it — no casts at the call sites.
 */
export class Bot {
  constructor(
    private readonly apiUrl: string,
    private readonly userAgent: string,
  ) {}

  /** POST `params` to the Action API and type the response at the call site. */
  async request<T>(params: Record<string, string>): Promise<T> {
    const body = new URLSearchParams({
      format: "json",
      formatversion: "2",
      ...params,
    });
    const res = await fetch(this.apiUrl, {
      method: "POST",
      headers: { "User-Agent": this.userAgent },
      body,
    });
    return (await res.json()) as T;
  }

  async getCsrfToken(): Promise<string> {
    const res = await this.request<ApiQueryResponse>({
      action: "query",
      meta: "tokens",
      type: "csrf",
    });
    const token = res.query.tokens?.csrftoken;
    if (token === undefined) {
      throw new Error("API returned no CSRF token");
    }
    return token;
  }

  async getWikitext(title: string): Promise<string | undefined> {
    const res = await this.request<ApiQueryResponse>({
      action: "query",
      prop: "revisions",
      titles: title,
      rvprop: "content",
      rvslots: "main",
    });
    const [page] = (res.query.pages ?? []) as QueryPage<"revisions">[];
    const [revision] = page?.revisions ?? [];
    return revision?.slots?.main?.content;
  }

  async editPage(title: string, text: string): Promise<ApiEditResponse> {
    const token = await this.getCsrfToken();
    const res = await this.request<ApiEditResponse>({
      action: "edit",
      title,
      text,
      token,
    });
    if (res.edit.result !== "Success") {
      throw new Error(`Edit failed: ${res.edit.result}`);
    }
    return res;
  }
}

// const bot = new Bot("https://www.mediawiki.org/w/api.php", "MyBot/1.0");
// await bot.editPage("Project:Sandbox", "Hello from a typed bot!");
