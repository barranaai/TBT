// Create one Airtable record, resilient to a table that's missing columns.
//
// Airtable rejects the WHOLE create with 422 UNKNOWN_FIELD_NAME if any field key
// doesn't exist (typecast only coerces values, it doesn't tolerate unknown
// fields). So on that specific error we drop the named field and retry — the
// record still lands with whatever columns DO exist. Any OTHER error is returned
// without retrying, so we never risk creating a duplicate after a transient 5xx.

export type CreateResult = { ok: boolean; dropped: string[] };

export async function createAirtableRecord(
  token: string,
  baseId: string,
  table: string,
  fields: Record<string, string | number>,
): Promise<CreateResult> {
  const working: Record<string, string | number> = { ...fields };
  const dropped: string[] = [];

  // Bounded by the number of fields; one unknown field is stripped per attempt.
  for (let attempt = 0; attempt < Object.keys(fields).length + 1; attempt++) {
    let res: Response;
    try {
      res = await fetch(
        `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(table)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ records: [{ fields: working }], typecast: true }),
        },
      );
    } catch (err) {
      console.error("[airtable] request failed", err);
      return { ok: false, dropped };
    }

    if (res.ok) return { ok: true, dropped };

    const body = await res.text();
    if (res.status === 422) {
      const m = /Unknown field name:\s*"([^"]+)"/i.exec(body);
      if (m && m[1] in working) {
        delete working[m[1]];
        dropped.push(m[1]);
        console.warn(`[airtable] dropped unknown field "${m[1]}" on ${table}`);
        continue;
      }
    }
    console.error("[airtable] create failed", res.status, body);
    return { ok: false, dropped };
  }
  return { ok: false, dropped };
}
