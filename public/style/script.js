const title = document.getElementById("title");

window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    const maxScroll = document.body.scrollHeight - window.innerHeight;

    // Scroll-Progress 0 → 1
    const progress = scrollY / maxScroll;

    // Move hue and multiple colors
    const hue1 = (progress * 360 * 3) % 360;
    const hue2 = (hue1 + 60) % 360;
    const hue3 = (hue1 + 120) % 360;
    const hue4 = (hue1 + 180) % 360;

    title.style.backgroundImage = `linear-gradient(
        90deg,
        hsl(${hue1}, 100%, 55%),
        hsl(${hue2}, 100%, 55%),
        hsl(${hue3}, 100%, 55%),
        hsl(${hue4}, 100%, 55%)
      )`;
});

// Starting state
title.style.backgroundImage = `linear-gradient(
      90deg,
      hsl(0, 100%, 55%),
      hsl(60, 100%, 55%),
      hsl(120, 100%, 55%),
      hsl(180, 100%, 55%)
    )`;