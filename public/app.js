const form = document.getElementById("rsvp-form");
const message = document.getElementById("form-message");
const button = document.getElementById("submit-button");
const plusOneFieldset = document.getElementById("plus-one-fieldset");
const guestNameWrapper = document.getElementById("guest-name-wrapper");
const guestNameInput = form.querySelector('input[name="guest_name"]');
const attendingDetails = document.getElementById("attending-details");
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

    form.reset();
    updateGuestFields();
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
