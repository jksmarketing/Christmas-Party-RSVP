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
    const attendance = clean(form.get("attendance"));
    const bringingGuest = clean(form.get("bringing_guest")) || "No";
    const guestName = clean(form.get("guest_name"));
    const notes = clean(form.get("notes"));
    const dietary = form.getAll("dietary").map(clean).filter(Boolean);

    if (!firstName || !lastName || !attendance) {
      return json({ error: "Please complete all required fields." }, 400);
    }

    if (!["Yes", "No"].includes(attendance)) {
      return json({ error: "Please choose whether you will attend." }, 400);
    }

    if (!["Yes", "No"].includes(bringingGuest)) {
      return json({ error: "Please choose a valid +1 option." }, 400);
    }

    if (bringingGuest === "Yes" && attendance !== "Yes") {
      return json({ error: "A +1 can only be added if you are attending." }, 400);
    }

    if (bringingGuest === "Yes" && !guestName) {
      return json({ error: "Please enter the name of your spouse / +1." }, 400);
    }

    if (!env.MONDAY_API_TOKEN || !env.MONDAY_BOARD_ID) {
      console.log("Monday.com is not configured yet.");
      return json({
        error: "The form is not connected to monday.com yet. Please add the Cloudflare MONDAY_API_TOKEN and MONDAY_BOARD_ID before using it live."
      }, 503);
    }

    const dietaryText = dietary.length ? dietary.join(", ") : "None specified";
    const columnValues = {
      color_mm7q3wsc: { label: attendance },
      text_mm7qpayv: dietaryText,
      long_text_mm7q2xpt: { text: notes },
      date_mm7qz3mx: { date: new Date().toISOString().slice(0, 10) },
      boolean_mm7qnsws: { checked: bringingGuest === "Yes" ? "true" : "false" },
      text_mm7qrs2s: bringingGuest === "Yes" ? guestName : ""
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

    if (!mondayResponse.ok || mondayResult.errors?.length || !mondayResult.data?.create_item?.id) {
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
