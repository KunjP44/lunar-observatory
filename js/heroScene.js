import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("hero-canvas");
const scene = new THREE.Scene();

// Add deep space fog to blend distant objects into the background
scene.fog = new THREE.FogExp2(0x030408, 0.015);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
// Start position (Hero view)
camera.position.set(0, 4, 14);

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let sunTapCount = 0;
let tapTimeout;

/* ================= LIGHTING ================= */
const ambientLight = new THREE.AmbientLight(0x222233, 1.5);
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffeedd, 50, 100);
scene.add(sunLight);

/* ================= SUN WITH GLOW ================= */
const sunGroup = new THREE.Group();

// Core
const sunGeometry = new THREE.SphereGeometry(1.5, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sunGroup.add(sun);

// Glow Effect (Additive blending)
const glowGeometry = new THREE.SphereGeometry(2.1, 32, 32);
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff8800,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending
});
const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
sunGroup.add(sunGlow);

scene.add(sunGroup);

/* ================= PLANETS ================= */
const planets = [];

function createPlanet(size, distance, speed, color, hasRings = false) {
    const group = new THREE.Group();

    // Planet Mesh
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.1
    });
    const planet = new THREE.Mesh(geometry, material);
    group.add(planet);

    // Optional Saturn-like rings
    if (hasRings) {
        const ringGeo = new THREE.RingGeometry(size * 1.4, size * 2.2, 64);
        const ringMat = new THREE.MeshStandardMaterial({
            color: color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.2;
        group.add(ring);
    }

    // Orbit Path Line
    const orbitPathGeo = new THREE.RingGeometry(distance - 0.02, distance + 0.02, 128);
    const orbitPathMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.05
    });
    const orbitPath = new THREE.Mesh(orbitPathGeo, orbitPathMat);
    orbitPath.rotation.x = Math.PI / 2;
    scene.add(orbitPath);

    scene.add(group);

    planets.push({
        group,
        mesh: planet,
        distance,
        speed,
        angle: Math.random() * Math.PI * 2
    });
}

// Create stylized planets
createPlanet(0.2, 3.5, 0.02, 0xaaaaaa); // Mercury
createPlanet(0.3, 5.0, 0.015, 0xe27b58); // Venus
createPlanet(0.35, 7.0, 0.01, 0x2b82c9); // Earth
createPlanet(0.25, 9.0, 0.008, 0xc1440e); // Mars
createPlanet(0.7, 13.0, 0.005, 0xd39c7e, true); // Jupiter/Saturn hybrid

/* ================= PARALLAX STARFIELD ================= */

function createStarLayer(count, size, opacity, depth) {

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {

        positions[i * 3] = (Math.random() - 0.5) * depth;
        positions[i * 3 + 1] = (Math.random() - 0.5) * depth;
        positions[i * 3 + 2] = (Math.random() - 0.5) * depth;

    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: size,
        transparent: true,
        opacity: opacity
    });

    const stars = new THREE.Points(geometry, material);

    scene.add(stars);

    return stars;
}

const starsNear = createStarLayer(800, 0.2, 0.8, 120);
const starsMid = createStarLayer(1200, 0.15, 0.6, 200);
const starsFar = createStarLayer(1600, 0.1, 0.4, 300);

/* ================= SCROLL INTERACTION ================= */
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
});

let scrollProgress = 0;

window.addEventListener("scroll", () => {

    const maxScroll = document.body.scrollHeight - window.innerHeight;

    scrollProgress = window.scrollY / maxScroll;

});

window.addEventListener("pointerdown", (event) => {

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObject(sun);

    if (intersects.length > 0) {

        sunTapCount++;

        clearTimeout(tapTimeout);

        tapTimeout = setTimeout(() => {
            sunTapCount = 0;
        }, 1200);

        if (sunTapCount === 7) {

            triggerSecret();

            sunTapCount = 0;

        }

    }

});

function triggerSecret() {

    const msg = document.createElement("div");

    msg.innerHTML = `
        ✨ To the one who inspired this universe.<br>
        Every orbit begins with you. ❤️
    `;;

    msg.style.position = "fixed";
    msg.style.bottom = "80px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.padding = "16px 28px";
    msg.style.borderRadius = "30px";
    msg.style.background = "rgba(10,15,30,0.85)";
    msg.style.color = "#ffffff";
    msg.style.fontSize = "14px";
    msg.style.backdropFilter = "blur(10px)";
    msg.style.zIndex = "9999";
    msg.style.textAlign = "center";

    document.body.appendChild(msg);

    sunGlow.material.opacity = 0.5;

    setTimeout(() => {
        sunGlow.material.opacity = 0.15;
    }, 2000);

    setTimeout(() => msg.remove(), 6000);

}
/* ================= ANIMATION LOOP ================= */
function animate() {
    requestAnimationFrame(animate);

    // Orbital Mechanics
    planets.forEach(p => {
        p.angle += p.speed * 0.2;
        p.group.position.x = Math.cos(p.angle) * p.distance;
        p.group.position.z = Math.sin(p.angle) * p.distance;
        p.mesh.rotation.y += 0.02; // Planet rotation
    });

    sunGroup.rotation.y += 0.002;
    starsNear.rotation.y += 0.00025;
    starsMid.rotation.y += 0.00015;
    starsFar.rotation.y += 0.00005;

    // Calculate Target Camera Positions based on Scroll Progress
    const targetZ = 14 - (scrollProgress * 8);
    const targetY = 4 - (scrollProgress * 2);
    const targetX = scrollProgress * 5;

    // Smoothly interpolate current camera position to target
    camera.position.z += (targetZ - camera.position.z) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.x += (targetX - camera.position.x) * 0.05;

    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();

/* ================= RESIZE HANDLING ================= */
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});