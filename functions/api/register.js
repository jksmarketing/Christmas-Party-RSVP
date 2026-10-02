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
      return json({ message: "Vielen Dank! Deine Anmeldung ist eingegangen." });
    }

    const firstName = clean(form.get("first_name"));
    const lastName = clean(form.get("last_name"));
    const attendance = clean(form.get("attendance"));
    const bringingGuest = clean(form.get("bringing_guest")) || "No";
    const guestName = clean(form.get("guest_name"));
    const notes = clean(form.get("notes"));
    const dietary = form.getAll("dietary").map(clean).filter(Boolean);

    if (!firstName || !lastName || !attendance) {
      return json({ error: "Bitte fülle alle Pflichtfelder aus." }, 400);
    }

    if (!["Yes", "No"].includes(attendance)) {
      return json({ error: "Bitte wähle aus, ob du teilnehmen wirst." }, 400);
    }

    if (!["Yes", "No"].includes(bringingGuest)) {
      return json({ error: "Bitte wähle eine gültige Option für die Begleitperson aus." }, 400);
    }

    if (bringingGuest === "Yes" && attendance !== "Yes") {
      return json({ error: "Eine Begleitperson kann nur hinzugefügt werden, wenn du teilnimmst." }, 400);
    }

    if (bringingGuest === "Yes" && !guestName) {
      return json({ error: "Bitte gib den Namen deiner Begleitperson ein." }, 400);
    }

    if (!env.MONDAY_API_TOKEN || !env.MONDAY_BOARD_ID) {
      console.log("Monday.com is not configured yet.");
      return json({
        error: "Das Formular ist noch nicht mit monday.com verbunden. Bitte hinterlege MONDAY_API_TOKEN und MONDAY_BOARD_ID in Cloudflare, bevor du es live nutzt."
      }, 503);
    }

    const dietaryText = dietary.length ? dietary.join(", ") : "Keine Angabe";
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
      return json({ error: "Deine Anmeldung konnte nicht gespeichert werden. Bitte versuche es später erneut." }, 502);
    }

    return json({ message: attendance === "Yes" ? "Du bist angemeldet! Wir freuen uns darauf, mit dir zu feiern. 🎄" : "Danke für deine Rückmeldung. Schade, dass du nicht dabei sein kannst!" });
  } catch (error) {
    console.error(error);
    return json({ error: "Es ist ein Fehler aufgetreten. Bitte versuche es erneut." }, 500);
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

