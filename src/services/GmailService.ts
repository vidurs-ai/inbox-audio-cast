export interface GmailEmail {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
}

function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/\"?([^\"]+)\"?\s*<([^>]+)>/);
  if (match) {
    return { name: match[1], email: match[2] };
  }
  return { name: from, email: from };
}

export async function listUnreadEmails(accessToken: string, maxResults = 20): Promise<GmailEmail[]> {
  const headers = { Authorization: `Bearer ${accessToken}` };

  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent("is:unread")}`,
    { headers }
  );
  if (!listRes.ok) {
    throw new Error(`Failed to list messages: ${listRes.status}`);
  }
  const listJson: { messages?: { id: string; threadId: string }[] } = await listRes.json();
  const ids = listJson.messages?.map((m) => m.id) ?? [];
  if (ids.length === 0) return [];

  const detailPromises = ids.map(async (id) => {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`Failed message ${id}: ${res.status}`);
    return res.json();
  });

  const details = await Promise.all(detailPromises);

  return details.map((d: any) => {
    const headersArr: Array<{ name: string; value: string }> = d.payload?.headers ?? [];
    const subject = headersArr.find((h) => h.name === "Subject")?.value ?? "(No subject)";
    const fromRaw = headersArr.find((h) => h.name === "From")?.value ?? "Unknown";
    const dateRaw = headersArr.find((h) => h.name === "Date")?.value ?? undefined;
    const { name, email } = parseFrom(fromRaw);

    const timestamp = dateRaw ? new Date(dateRaw).toLocaleString() : new Date(Number(d.internalDate)).toLocaleString();

    return {
      id: d.id,
      sender: name,
      senderEmail: email,
      subject,
      preview: d.snippet ?? "",
      timestamp,
      isUnread: true,
    } as GmailEmail;
  });
}
