import { type NextRequest, NextResponse } from "next/server"
import { siteConfig } from "@/content/site"
import {
  asSheetRows,
  fetchGoogleScriptJson,
  fetchSheetTabRows,
  invalidateSheetsCache,
  listResponseHeaders,
  SHEETS_CACHE_KEYS,
  withSheetsCache,
} from "@/lib/sheets-cache"

// Replace this with your Entourage Google Apps Script URL
const ENTOURAGE_SCRIPT_URL = siteConfig.googleAPI.entourage
const ENTOURAGE_TAB = "Entourage"

// Entourage interface
export interface Entourage {
  Name: string
  RoleCategory: string
  RoleTitle: string
  Email: string
}

function isEntourageRow(row: unknown): boolean {
  if (!row || typeof row !== "object") return false
  const r = row as Record<string, unknown>
  return ["Name", "name", "newName", "NewName"].some((key) => typeof r[key] === "string" && r[key])
}

/**
 * Apps Script first; if it fails or returns another tab's rows (e.g. PrincipalSponsors),
 * read the Entourage tab directly from the shared spreadsheet.
 */
async function fetchEntourageRows(): Promise<unknown[] | null> {
  try {
    const rows = asSheetRows(await fetchGoogleScriptJson(ENTOURAGE_SCRIPT_URL))
    if (rows?.some(isEntourageRow)) return rows
    console.warn("Entourage Apps Script did not return entourage rows; reading the Entourage tab directly")
  } catch (error) {
    console.warn("Entourage Apps Script failed; reading the Entourage tab directly:", error)
  }

  // Sheet headers vary (e.g. "newName", camelCase) — return the same shape the Apps Script does
  const rows: Entourage[] = (await fetchSheetTabRows(siteConfig.googleAPI.googleShare, ENTOURAGE_TAB))
    .map((r) => ({
      Name: r.Name ?? r.name ?? r.newName ?? r.NewName ?? "",
      RoleCategory: r.RoleCategory ?? r.roleCategory ?? "",
      RoleTitle: r.RoleTitle ?? r.roleTitle ?? "",
      Email: r.Email ?? r.email ?? "",
    }))
    .filter((r) => r.Name)
  return rows.length > 0 ? rows : null
}

// GET: Fetch all entourage
export async function GET() {
  try {
    const data = await withSheetsCache(SHEETS_CACHE_KEYS.entourage, async () => {
      const rows = await fetchEntourageRows()
      if (!rows) {
        throw new Error("Failed to fetch entourage")
      }
      return rows
    })

    return NextResponse.json(data, { status: 200, headers: listResponseHeaders })
  } catch (error) {
    console.error('Error fetching entourage:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entourage' },
      { status: 500 }
    )
  }
}

// POST: Add a new entourage member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { Name, RoleCategory, RoleTitle, Email } = body

    // Validation
    if (!Name || typeof Name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const entourageData: Record<string, string> = {
      Name: Name.trim(),
      RoleCategory: RoleCategory?.trim() || '',
      Email: Email?.trim() || '',
    }
    if (RoleTitle?.trim()) {
      entourageData.RoleTitle = RoleTitle.trim()
    }

    const response = await fetch(ENTOURAGE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entourageData),
    })

    if (!response.ok) {
      throw new Error('Failed to add entourage member')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.entourage)
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding entourage member:', error)
    return NextResponse.json(
      { error: 'Failed to add entourage member' },
      { status: 500 }
    )
  }
}

// PUT: Update an existing entourage member
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { Name, RoleCategory, RoleTitle, Email, originalName } = body

    // Validation
    if (!Name || typeof Name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const updateData = {
      action: 'update',
      originalName: originalName || Name, // Use originalName for lookup, Name for update
      Name: Name.trim(),
      RoleCategory: RoleCategory?.trim() || '',
      RoleTitle: RoleTitle?.trim() || '',
      Email: Email?.trim() || '',
    }

    const response = await fetch(ENTOURAGE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    })

    if (!response.ok) {
      throw new Error('Failed to update entourage member')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.entourage)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error updating entourage member:', error)
    return NextResponse.json(
      { error: 'Failed to update entourage member' },
      { status: 500 }
    )
  }
}

// DELETE: Delete an entourage member
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { Name } = body

    // Validation
    if (!Name || typeof Name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const deleteData = {
      action: 'delete',
      Name: Name.trim(),
    }

    const response = await fetch(ENTOURAGE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deleteData),
    })

    if (!response.ok) {
      throw new Error('Failed to delete entourage member')
    }

    const data = await response.json()
    invalidateSheetsCache(SHEETS_CACHE_KEYS.entourage)
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error deleting entourage member:', error)
    return NextResponse.json(
      { error: 'Failed to delete entourage member' },
      { status: 500 }
    )
  }
}