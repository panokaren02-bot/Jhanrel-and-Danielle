import { setDefaultResultOrder } from "node:dns"

setDefaultResultOrder("ipv4first")

type CacheEntry<T> = {
  value?: T
  expiresAt: number
  inflight?: Promise<T>
}

const store = new Map<string, CacheEntry<unknown>>()

export const SHEETS_CACHE_KEYS = {
  guests: "guests",
  entourage: "entourage",
  sponsors: "sponsors",
} as const

const DEFAULT_TTL_MS = 25_000

function isUsefulList(value: unknown) {
  return Array.isArray(value) && value.length > 0
}

export async function withSheetsCache<T>(
  key: string,
  loader: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now()
  const existing = store.get(key) as CacheEntry<T> | undefined

  if (existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value
  }

  if (existing?.inflight) {
    // Stale-while-revalidate: don't make visitors wait on a slow Apps Script refresh
    return existing.value !== undefined ? existing.value : existing.inflight
  }

  const inflight = loader()
    .then((value) => {
      if (isUsefulList(value)) {
        store.set(key, { value, expiresAt: Date.now() + ttlMs })
      } else if (existing?.value !== undefined) {
        // Keep the last good list rather than flashing an empty one
        store.set(key, { value: existing.value, expiresAt: 0 })
      } else {
        store.delete(key)
      }
      return value
    })
    .catch((error) => {
      const current = store.get(key) as CacheEntry<T> | undefined
      if (current?.inflight === inflight) {
        store.set(key, {
          value: existing?.value,
          expiresAt: existing?.expiresAt ?? 0,
        })
      }
      throw error
    })

  store.set(key, {
    value: existing?.value,
    expiresAt: existing?.expiresAt ?? 0,
    inflight,
  })

  if (existing?.value !== undefined) {
    inflight.catch((error) => console.warn(`Background refresh failed for ${key}:`, error))
    return existing.value
  }

  return inflight
}

export function invalidateSheetsCache(key: string) {
  store.delete(key)
}

export function asSheetRows(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== "object") return null

  const record = payload as Record<string, unknown>
  for (const key of ["data", "GoogleSheetData", "entourage", "sponsors", "rows", "items"]) {
    if (Array.isArray(record[key])) return record[key]
  }

  return null
}

export async function fetchGoogleScriptJson(url: string): Promise<unknown> {
  let lastError: unknown

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
      })

      if (!response.ok) {
        throw new Error(`Google Script request failed (${response.status})`)
      }

      return response.json()
    } catch (error) {
      lastError = error
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Google Script request failed")
}

function googleScriptErrorMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null
  if (!("error" in data) || (data as { error?: unknown }).error == null) return null
  const message = String((data as { error: unknown }).error).trim()
  return message || null
}

function parseGoogleScriptBody(text: string): unknown {
  const trimmed = text.trim()
  if (!trimmed || trimmed.startsWith("<")) return undefined

  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return undefined
  }
}

/**
 * POST to a Google Apps Script web app.
 * doPost runs before ContentService 302s to an HTML echo page, so a missing
 * or non-JSON body still means the sheet write already happened.
 */
export async function postGoogleScriptJson(url: string, payload: unknown): Promise<unknown> {
  let response: Response

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
    })
  } catch (error) {
    console.warn("Google Script POST transport error after write:", error)
    return { success: true }
  }

  const text = await response.text().catch(() => "")
  const data = parseGoogleScriptBody(text)
  const scriptError = googleScriptErrorMessage(data)
  if (scriptError) {
    throw new Error(scriptError)
  }

  return data ?? { success: true }
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (ch === '"') {
        quoted = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ",") {
      row.push(field)
      field = ""
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ""
    } else {
      field += ch
    }
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function spreadsheetIdFromUrl(url: string): string | null {
  return url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1] ?? null
}

/**
 * Read one tab of a link-shared spreadsheet straight from Google Sheets (no Apps Script).
 * Rows come back keyed by the header row; blank headers and blank rows are dropped.
 */
export async function fetchSheetTabRows(
  spreadsheetUrl: string,
  tab: string,
): Promise<Record<string, string>[]> {
  const id = spreadsheetIdFromUrl(spreadsheetUrl)
  if (!id) throw new Error("Invalid spreadsheet URL")

  const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`
  const response = await fetch(url, {
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  })
  if (!response.ok) {
    throw new Error(`Google Sheets request failed (${response.status})`)
  }

  const [header = [], ...body] = parseCsv(await response.text())
  const keys = header.map((key) => key.trim())
  return body
    .map((cells) => {
      const row: Record<string, string> = {}
      keys.forEach((key, index) => {
        if (key) row[key] = (cells[index] ?? "").trim()
      })
      return row
    })
    .filter((row) => Object.values(row).some(Boolean))
}

export const listResponseHeaders = {
  "Cache-Control": "public, max-age=20, stale-while-revalidate=60",
} as const
