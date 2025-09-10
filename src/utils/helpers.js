export function setButtonText(btn,
  isLoading,
  defaultText = "Save", loadingText = "Saving...") {
  if (btn) {
    if (isLoading) {
      btn.textContent = loadingText || "Saving...";
      btn.disabled = true;
      console.log(`Setting text to ${loadingText}`);
    } else {
      btn.textContent = defaultText || "Save";
      btn.disabled = false;
    }
  }
}