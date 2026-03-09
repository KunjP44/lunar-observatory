document.addEventListener("DOMContentLoaded", () => {
    // 1. Initial Load Animation (Enter)
    document.body.classList.add("page-transition");

    // Slight delay ensures the browser applies the initial 0 opacity before transitioning
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add("active");
        });
    });

    // 2. Page Exit Animation (Intercepting Link Clicks)
    const links = document.querySelectorAll('a[href]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetUrl = link.href;

            // Only apply to internal links
            if (targetUrl.startsWith(window.location.origin)) {
                const targetPath = new URL(targetUrl).pathname;
                const currentPath = window.location.pathname;

                // Ensure it's actually navigating to a DIFFERENT page 
                // (prevents triggering on #anchor links like "index.html#features" if already on index.html)
                if (targetPath !== currentPath || (targetPath === currentPath && targetUrl.includes('.html') && !window.location.href.includes('.html'))) {

                    e.preventDefault(); // Stop immediate jump

                    // Trigger the exit animation
                    document.body.classList.remove('active');
                    document.body.classList.add('fade-out');

                    // Wait for the CSS transition to finish (400ms) before navigating
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 400);
                }
            }
        });
    });
});