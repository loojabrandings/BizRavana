/**
 * Fetches email addresses for the given user IDs from auth.users.
 * Uses the /api/admin/user-emails endpoint.
 * Only works for super admins.
 *
 * @param userIds - Array of user UUIDs to look up
 * @returns A map of user_id → email
 */
export async function fetchUserEmails(
  userIds: string[],
): Promise<Record<string, string>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];

  if (uniqueIds.length === 0) {
    return {};
  }

  try {
    const response = await fetch("/api/admin/user-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: uniqueIds }),
    });

    if (!response.ok) {
      console.error("Failed to fetch user emails:", await response.text());
      return {};
    }

    const data = (await response.json()) as {
      emails: Record<string, string>;
    };
    return data.emails || {};
  } catch (err) {
    console.error("Error fetching user emails:", err);
    return {};
  }
}
