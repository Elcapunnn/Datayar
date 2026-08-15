export interface ApiResult<T> {
  ok: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
  requestId?: string;
  status: number;
}

/**
 * Robust JSON fetcher with safe error handling and non-JSON / HTML fallback protection
 */
export async function fetchJson<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const requestId = res.headers.get('x-request-id') || undefined;
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let errorMessage = `Server error (${res.status})`;
      let errorCode = `HTTP_${res.status}`;
      let retryable = res.status === 429 || res.status >= 500;

      if (isJson) {
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errorMessage = errData.error.message;
            errorCode = errData.error.code || errorCode;
            retryable = errData.error.retryable ?? retryable;
          } else if (errData?.error && typeof errData.error === 'string') {
            errorMessage = errData.error;
          }
        } catch {
          // fallback to status text
        }
      } else {
        const text = await res.text();
        if (text && text.length < 200 && !text.includes('<html')) {
          errorMessage = text;
        }
      }

      return {
        ok: false,
        data: null,
        error: {
          code: errorCode,
          message: errorMessage,
          retryable,
        },
        requestId,
        status: res.status,
      };
    }

    if (isJson) {
      const data = (await res.json()) as T;
      return {
        ok: true,
        data,
        error: null,
        requestId,
        status: res.status,
      };
    } else {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text) as T;
        return {
          ok: true,
          data: parsed,
          error: null,
          requestId,
          status: res.status,
        };
      } catch {
        return {
          ok: false,
          data: null,
          error: {
            code: 'INVALID_JSON_RESPONSE',
            message: 'Server returned non-JSON response payload.',
            retryable: true,
          },
          requestId,
          status: res.status,
        };
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        ok: false,
        data: null,
        error: {
          code: 'REQUEST_ABORTED',
          message: 'The search request was cancelled by a newer query.',
          retryable: false,
        },
        status: 0,
      };
    }

    return {
      ok: false,
      data: null,
      error: {
        code: 'NETWORK_ERROR',
        message: err.message || 'Failed to connect to the search server.',
        retryable: true,
      },
      status: 0,
    };
  }
}
