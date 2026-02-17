/**
 * ntfy notifications - same pattern as Palm Riders scooter project
 * POST to ntfy.sh/{topic} (or NTFY_BASE_URL) with Title, Priority, Tags headers
 */

const NTFY_BASE = process.env.NTFY_BASE_URL || "https://ntfy.sh";

export interface NtfyOptions {
  title?: string;
  priority?: "min" | "low" | "default" | "high" | "urgent";
  tags?: string;
}

export async function sendNtfy(
  topic: string,
  message: string,
  options: NtfyOptions = {}
): Promise<void> {
  const { title, priority = "high", tags = "bell" } = options;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "text/plain",
      Priority: priority,
      Tags: tags,
    };
    if (title) headers["Title"] = title;

    const url = `${NTFY_BASE.replace(/\/$/, "")}/${topic}`;
    await fetch(url, {
      method: "POST",
      headers,
      body: message,
    });
  } catch (err) {
    console.error(`ntfy failed for topic ${topic}:`, err);
  }
}
