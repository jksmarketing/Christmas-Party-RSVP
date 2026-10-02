const form = document.getElementById("rsvp-form");
const message = document.getElementById("form-message");
const button = document.getElementById("submit-button");
const plusOneFieldset = document.getElementById("plus-one-fieldset");
const guestNameWrapper = document.getElementById("guest-name-wrapper");
const guestNameInput = form.querySelector('input[name="guest_name"]');
const attendingDetails = document.getElementById("attending-details");
const confirmDialog = document.getElementById("confirm-dialog");
const plusOneReminder = document.getElementById("plus-one-reminder");
const guestEmailLink = document.getElementById("guest-email-link");
const confirmClose = document.getElementById("confirm-close");
let focusBeforeDialog = null;
function closeConfirmation() {
  confirmDialog.classList.remove("is-open");
  confirmDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("dialog-open");
  focusBeforeDialog?.focus?.();
}
function showConfirmation(bringingGuest) {
  focusBeforeDialog = document.activeElement;
  plusOneReminder.hidden = !bringingGuest;
  if (bringingGuest) {
    const origin = window.location.origin;
    const subject = "A Real JKS Christmas 2026 – Deine Einladung";
    const body = [
      "Du bist herzlich eingeladen, mit mir Weihnachten zu feiern! ✨",
      "",
      "A REAL JKS CHRISTMAS",
      "Freitag, 4. Dezember 2026",
      "Ankunft ab 17:30 Uhr",
      "Juckerhof, Seegräben",
      "",
      "Einladungskarte: " + origin + "/assets/jks-christmas-invitation-card.png",
      "Kalendereintrag: " + origin + "/assets/jks-christmas-2026.ics",
      "",
      "Ich freue mich auf einen schönen gemeinsamen Abend!"
    ].join("\n");
    guestEmailLink.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }
  confirmDialog.classList.add("is-open");
  confirmDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("dialog-open");
  confirmClose.focus();
}
confirmClose.addEventListener("click", closeConfirmation);
confirmDialog.addEventListener("click", (event) => {if (event.target === confirmDialog) closeConfirmation();});
document.addEventListener("keydown", (event) => {
  if (!confirmDialog.classList.contains("is-open")) return;
  if (event.key === "Escape") closeConfirmation();
  if (event.key === "Tab") {
    const focusables = [...confirmDialog.querySelectorAll('button, a[href]')];
    const current = focusables.indexOf(document.activeElement);
    if (event.shiftKey && current === 0) { event.preventDefault(); focusables[focusables.length - 1].focus(); }
    else if (!event.shiftKey && current === focusables.length - 1) { event.preventDefault(); focusables[0].focus(); }
  }
});
const attendanceInputs = form.querySelectorAll('input[name="attendance"]');
const guestInputs = form.querySelectorAll('input[name="bringing_guest"]');

function setHidden(element, hidden) {
  element.classList.toggle("hidden", hidden);
  element.setAttribute("aria-hidden", String(hidden));
}

function updateGuestFields() {
  const attendance = form.querySelector('input[name="attendance"]:checked')?.value;
  const bringingGuest = form.querySelector('input[name="bringing_guest"]:checked')?.value;
  const attending = attendance === "Yes";
  const showGuestName = attending && bringingGuest === "Yes";

  setHidden(plusOneFieldset, !attending);
  setHidden(attendingDetails, !attending);

  attendingDetails.querySelectorAll('input, textarea').forEach((field) => {
    field.disabled = !attending;
    if (!attending) {
      if (field.type === "checkbox") field.checked = false;
      if (field.tagName === "TEXTAREA") field.value = "";
    }
  });

  setHidden(guestNameWrapper, !showGuestName);
  guestNameInput.required = showGuestName;

  if (!attending) {
    const defaultGuestNo = form.querySelector('input[name="bringing_guest"][value="No"]');
    if (defaultGuestNo) defaultGuestNo.checked = true;
    guestNameInput.value = "";
  }

  if (!showGuestName) {
    guestNameInput.value = "";
  }
}

attendanceInputs.forEach((input) => input.addEventListener("change", updateGuestFields));
guestInputs.forEach((input) => input.addEventListener("change", updateGuestFields));
updateGuestFields();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "message";

  if (!form.reportValidity()) return;

  button.disabled = true;
  button.textContent = "Wird gesendet…";

  const data = new FormData(form);

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      body: data
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Etwas ist schiefgelaufen.");

    const attending = data.get("attendance") === "Yes";
    form.reset();
    updateGuestFields();
    if (attending) showConfirmation(data.get("bringing_guest") === "Yes");
    message.textContent = result.message || "Vielen Dank! Deine Anmeldung ist eingegangen. 🎄";
    message.className = "message success";
    button.textContent = "Anmeldung gesendet ✓";
  } catch (error) {
    message.textContent = error.message || "Entschuldigung, deine Anmeldung konnte nicht gesendet werden. Bitte versuche es erneut.";
    message.className = "message error";
    button.disabled = false;
    button.textContent = "Anmeldung senden";
  }
});

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("js-motion");
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}
