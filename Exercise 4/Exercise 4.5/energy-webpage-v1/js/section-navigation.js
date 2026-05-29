document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".exercise-section");

  if (sections.length === 0) return;

  function showSection(id) {
    let matched = false;
    sections.forEach(section => {
      if (section.id === id) {
        section.classList.remove("is-hidden");
        matched = true;
      } else {
        section.classList.add("is-hidden");
      }
    });
    if (!matched) sections[0].classList.remove("is-hidden");

    // Trigger renders when section becomes visible
    if (id === "exercise-4-3" && typeof renderExercise43 === "function") {
      renderExercise43();
    }
    if (id === "exercise-4-5" && typeof renderExercise45 === "function") {
      renderExercise45();
    }
  }

  const hash = window.location.hash.replace("#", "");
  showSection(hash || "exercise-4-1");

  document.querySelectorAll('a[href^="#exercise-4"]').forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").replace("#", "");
      history.pushState(null, "", "#" + id);
      showSection(id);
    });
  });

  window.addEventListener("popstate", () => {
    const id = window.location.hash.replace("#", "") || "exercise-4-1";
    showSection(id);
  });
});