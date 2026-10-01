const form = document.getElementById("rsvp-form");
const message = document.getElementById("form-message");
const button = document.getElementById("submit-button");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  message.textContent = "";
  message.className = "message";
  button.disabled = true;
  button.textContent = "Sending…";

  const data = new FormData(form);

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      body: data
    });

    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Something went wrong.");

    form.reset();
    message.textContent = result.message || "Thank you! Your registration has been received. 🎄";
    message.className = "message success";
    button.textContent = "Registration sent ✓";
  } catch (error) {
    message.textContent = error.message || "Sorry, we couldn't submit your registration. Please try again.";
    message.className = "message error";
    button.disabled = false;
    button.textContent = "Send registration";
  }
});
