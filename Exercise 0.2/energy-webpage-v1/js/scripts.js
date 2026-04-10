const navLinks = document.querySelectorAll(".nav-links a");
const pages = document.querySelectorAll(".page");
const logo = document.querySelector(".logo");

function showPage(pageId) {

  // Hide all of the active page
  pages.forEach(page => {
    page.classList.remove("active-page");
  });

  // Remove active highlight for nav link
  navLinks.forEach(link => {
    link.classList.remove("active");
  });

  // Find the selected page using its ID
  const selectedPage = document.getElementById(pageId);
  if (selectedPage) {
    selectedPage.classList.add("active-page"); // Show selected page
  }

  // Find the corresponding nav link and highlight it
  const activeLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }
}

// Add click event to each nav link
navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault();
    const pageId = this.getAttribute("data-page");
    showPage(pageId);
  });
});


logo.addEventListener("click", function () {
  showPage("home");
});


showPage("home");