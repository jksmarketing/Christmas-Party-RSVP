/**
 * POST /api/register
 *
 * The browser submits the RSVP here.
 * The monday.com API token stays on the server as a Cloudflare secret.
 *
 * Required Cloudflare environment variables/secrets:
 * - MONDAY_API_TOKEN
 * - MONDAY_BOARD_ID
 * - MONDAY_GROUP_ID (optional)
 *
 * Before going live, set the column IDs below to match your monday board.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const form = await request.formData();

    // Simple anti-spam honeypot.
    if (String(form.get("website") || "").trim()) {
      return json({ message: "Thank you! Your registration has been received." });
    }

    const firstName = clean(form.get("first_name"));
    const lastName = clean(form.get("last_name"));
    const email = clean(form.get("email"));
    const attendance = clean(form.get("attendance"));
    const notes = clean(form.get("notes"));
    const dietary = form.getAll("dietary").map(clean).filter(Boolean);

    if (!firstName || !lastName || !email || !attendance) {
      return json({ error: "Please complete all required fields." }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "Please enter a valid email address." }, 400);
    }

    if (!env.MONDAY_API_TOKEN || !env.MONDAY_BOARD_ID) {
      // Safe response while the site is being designed/tested.
      // No participant data is stored anywhere in this version.
      console.log("Monday.com is not configured yet.");
      return json({
        message: "Thank you! The form works, but the monday.com connection still needs to be configured."
      });
    }

    // IMPORTANT:
    // Replace these example column IDs with the actual IDs from your monday board.
    const columnValues = {
      // email: { email: email, text: email },
      // status: { label: attendance },
      // dietary: dietary.join(", "),
      // notes: notes
    };

    const mutation = `
      mutation CreateChristmasRSVP(
        $boardId: ID!,
        $groupId: String,
        $itemName: String!,
        $columnValues: JSON
      ) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) { id }
      }
    `;

    const mondayResponse = await fetch("https://api.monday.com/v2", {
      method: "POST",
      headers: {
        "Authorization": env.MONDAY_API_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          boardId: String(env.MONDAY_BOARD_ID),
          groupId: env.MONDAY_GROUP_ID || null,
          itemName: `${firstName} ${lastName}`,
          columnValues: JSON.stringify(columnValues)
        }
      })
    });

    const mondayResult = await mondayResponse.json();

    if (!mondayResponse.ok || mondayResult.errors) {
      console.error("monday.com error", mondayResult);
      return json({ error: "We couldn't save your registration. Please try again later." }, 502);
    }

    return json({ message: "You're registered! We look forward to celebrating with you. 🎄" });
  } catch (error) {
    console.error(error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
}

function clean(value) {
  return String(value ?? "").trim().slice(0, 2000);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
