const canvas = document.getElementById("starfield");
const ctx = canvas.getContext("2d");

let stars = [];
let mouse = { x: -1000, y: -1000 };

// Fix High-DPI screen stretching
function resizeCanvas() {
    // Get the display's pixel density
    const dpr = window.devicePixelRatio || 1;

    // Scale the internal canvas dimensions by the DPR
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    // Lock the CSS display size to the window size
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    // Normalize the coordinate system so drawing uses standard CSS pixels
    ctx.scale(dpr, dpr);
}

// Set initial size
resizeCanvas();

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// Remove repulsion force when mouse leaves the window
window.addEventListener("mouseout", () => {
    mouse.x = -1000;
    mouse.y = -1000;
});

for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        // Set a minimum size (+ 0.8) so they never become sub-pixel smudges
        size: Math.random() * 1.2 + 0.8,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
    });
}

function animate() {
    // Clear using window dimensions because the context is scaled
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    stars.forEach(star => {
        star.x += star.vx;
        star.y += star.vy;

        let dx = mouse.x - star.x;
        let dy = mouse.y - star.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 180) {
            star.x -= dx * 0.01;
            star.y -= dy * 0.01;
        }

        // Keep stars looping infinitely on-screen
        if (star.x < 0) star.x = window.innerWidth;
        if (star.x > window.innerWidth) star.x = 0;
        if (star.y < 0) star.y = window.innerHeight;
        if (star.y > window.innerHeight) star.y = 0;

        // Draw perfect circles
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fill();
        ctx.closePath();
    });

    requestAnimationFrame(animate);
}

animate();