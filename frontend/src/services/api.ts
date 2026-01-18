const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

type ApiError = {
  status: number;
  message: string;
};

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    // Network / CORS / backend down
    throw {
      status: 0,
      message: "Network error or backend unreachable",
    } as ApiError;
  }

  const data = await safeJson(res);

  if (!res.ok) {
    throw {
      status: res.status,
      message:
        (data && (data.detail || data.error)) ||
        `API error: ${res.status}`,
    } as ApiError;
  }

  return data as T;
}

export async function apiPost<T = any>(
  path: string,
  body?: unknown
): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw {
      status: 0,
      message: "Network error or backend unreachable",
    } as ApiError;
  }

  const data = await safeJson(res);

  if (!res.ok) {
    throw {
      status: res.status,
      message:
        (data && (data.detail || data.error)) ||
        `API error: ${res.status}`,
    } as ApiError;
  }

  return data as T;
}
