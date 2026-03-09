// Advanced Scroll Reveal Animation
// This targets individual elements (titles, cards) instead of whole sections
const revealElements = document.querySelectorAll(".reveal");

const revealOptions = {
    threshold: 0.15, // Trigger when 15% of the element is visible
    rootMargin: "0px 0px -50px 0px" // Trigger slightly before the element hits the bottom
};

const revealOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            // Add the active class to trigger the CSS transition
            entry.target.classList.add("active");
            // Stop observing once revealed so it doesn't re-animate when scrolling up
            observer.unobserve(entry.target);
        }
    });
}, revealOptions);

revealElements.forEach(el => {
    revealOnScroll.observe(el);
});