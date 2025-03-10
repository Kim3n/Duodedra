document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.querySelector(".overlay");
  const overlayContainer = document.querySelector(".overlay_container");
  const overlayText = overlayContainer.querySelector(".overlay_text");
  const message = overlayContainer.querySelector(".message");
  const overlayContent = overlayContainer.querySelector(".overlay_content");
  const overlayControls = overlayContainer.querySelector(".overlay_controls");
  let activeListItem = null;

  // Overlay content mapping
  const contentMap = {
    Login: {
      text: "Log in to existing account?",
      content: `
        <form action="/login" method="POST" id="loginForm">
          <input type="text" name="username" placeholder="Username" required />
          <input type="password" name="password" placeholder="Password" required />
        </form>
      `,
      controls: `
        <button type="submit" form="loginForm" class="btn btn_yes">Yes</button>
        <a href="#" class="btn btn_no" data-overlay-close="continue">No</a>
      `,
    },
    Register: {
      text: "Register a new account?",
      content: `
          <form action="/register" method="POST" id="registerForm">
            <input type="text" name="username" placeholder="Username" required />
            <input type="password" name="password" placeholder="Password" required />
          </form>,
      `,
      controls: `
        <button type="submit" form="registerForm" class="btn btn_yes">Yes</button>
        <a href="#" class="btn btn_no" data-overlay-close="new">No</a>
      `,
    },
    Credits: {
      text: "View credits?",
      content: `
  
    <p>Made by Kim3n</p>
  
    `,
      controls: `
        <a href="https://github.com/Kim3n" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="credits">No</a>
      `,
    },
    Leaderboard: {
      text: "Are you sure you want to go to leaderboard page?",
      controls: `
        <a href="/leaderboard" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="quit">No</a>
      `,
    },
    Usersettings: {
      text: "Are you sure you want to go the user settings?",
      controls: `
        <a href="/dashboard" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="quit">No</a>
      `,
    },
    Learn: {
      text: "Ready to start learning?",
      controls: `
        <a href="/learn" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="quit">No</a>
      `,
    },
    Admin: {
      text: "Go to admin page?",
      controls: `
        <a href="/admin" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="quit">No</a>
      `,
    },
    Logout: {
      text: "Are you sure you want to logout?",
      controls: `
        <a href="/logout" class="btn btn_yes">Yes</a>
        <a href="#" class="btn btn_no" data-overlay-close="quit">No</a>
      `,
    },
  };

  // Activate overlay function
  function activateOverlay(event) {
    event.preventDefault();
    activeListItem = event.target;
    const key = activeListItem.getAttribute("data-overlay-activate");

    if (contentMap[key]) {
      overlayText.textContent = contentMap[key].text;
      if (contentMap[key].content) {
        overlayContent.innerHTML = contentMap[key].content;
      } else {
        overlayContent.innerHTML = "";
      }
      overlayControls.innerHTML = contentMap[key].controls;
      overlay.classList.add("active");
    }
    activeListItem.classList.add("active");
  }

  function openOverlay(overlayKey) {
    if (!contentMap[overlayKey]) return;

    overlayText.textContent = contentMap[overlayKey].text;
    overlayContent.innerHTML = contentMap[overlayKey].content;
    overlayControls.innerHTML = contentMap[overlayKey].controls;
    overlay.classList.add("active");
  }

  if (window.showOverlay) {
    openOverlay(window.showOverlay);
  }

  // Event listeners for menu items
  document.querySelectorAll(".menu a").forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      const key = event.target.getAttribute("data-overlay-activate");
      openOverlay(key);
    });
  });

  // Close overlay function
  function closeOverlay(event) {
    event.preventDefault();
    if (activeListItem) {
      activeListItem.classList.remove("active");
    }
    overlay.classList.remove("active");
    message.innerHTML = "";
  }

  // Event listeners for menu items
  document.querySelectorAll(".menu a").forEach((item) => {
    item.addEventListener("click", activateOverlay);
  });

  // Event listener for closing overlay when clicking 'No'
  document.addEventListener("click", (event) => {
    if (event.target.matches("[data-overlay-close]")) {
      closeOverlay(event);
    }
  });
});
