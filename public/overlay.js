document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("overlay");
  const closeOverlay = document.getElementById("closeOverlay");
  const openOverlayBtn = document.getElementById("openOverlayBtn");

  // Open Overlay
  openOverlayBtn.addEventListener("click", function () {
    overlay.classList.add("active");
  });

  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-overlay-close]")) {
      overlay.classList.remove("active");
    }
  });
});
