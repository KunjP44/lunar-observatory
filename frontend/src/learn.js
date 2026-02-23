import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

let currentRenderer = null;
let currentAnimationFrame = null;

let initialized = false;

export function initLearnMode() {

    if (initialized) return;
    initialized = true;

    const lessonButtons = document.querySelectorAll(".lesson-btn");
    const backBtn = document.getElementById("learn-back-btn");

    lessonButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const lesson = e.target.closest(".lesson-card").dataset.lesson;
            openLesson(lesson);
        });
    });

    backBtn?.addEventListener("click", closeLesson);
}

function openLesson(lessonName) {

    document.getElementById("learn-home").classList.add("hidden");
    document.getElementById("learn-detail").classList.remove("hidden");

    const container = document.getElementById("learn-lesson-container");
    // Clear previous content
    container.innerHTML = `
        <div class="lesson-layout">
            <div id="lesson-scene"></div>
            <div class="lesson-text">
                <div class="lesson-scroll"></div>
            </div>
        </div>
    `;

    const textDiv = document.querySelector(".lesson-scroll");
    const sceneDiv = document.getElementById("lesson-scene");

    if (lessonName === "solar-eclipse") {
        createSolarEclipseScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Solar Eclipse</h2>

            <p>
                A solar eclipse occurs when the <b>Moon</b> passes directly between 
                the <b>Earth</b> and the <b>Sun</b>.
            </p>

            <p>
                The Moon casts a shadow on Earth. The darkest central region is 
                called the <b>Umbra</b>, where a total eclipse is visible.
                The lighter outer region is the <b>Penumbra</b>, where only part 
                of the Sun is covered.
            </p>

            <p>
                This alignment can only occur during a <b>New Moon</b>.
            </p>

            <div class="lesson-extra">

                <h4>Why Doesn't It Happen Every Month?</h4>
                <p>
                    The Moon’s orbit is tilted by about <b>5°</b> relative to Earth's 
                    orbit around the Sun. Because of this tilt, most New Moons pass 
                    slightly above or below the Sun in the sky.
                </p>

                <p>
                    Eclipses occur only when the New Moon happens near the 
                    <b>line of nodes</b> — the intersection of the Moon's orbital plane 
                    and Earth's orbital plane.
                </p>

                <h4>Types of Solar Eclipses</h4>
                <ul>
                    <li><b>Total Eclipse</b> – Sun completely covered.</li>
                    <li><b>Annular Eclipse</b> – Moon appears smaller; ring of fire visible.</li>
                    <li><b>Partial Eclipse</b> – Only part of the Sun covered.</li>
                    <li><b>Hybrid Eclipse</b> – Rare transition between total and annular.</li>
                </ul>

                <h4>Angular Size Coincidence</h4>
                <p>
                    The Sun is about 400 times larger than the Moon — but also about 
                    400 times farther away. This coincidence makes both appear nearly 
                    the same size in the sky, allowing total eclipses to occur.
                </p>

                <h4>Observation Safety</h4>
                <p>
                    Never look directly at the Sun without proper solar filters. 
                    Permanent eye damage can occur within seconds.
                </p>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "lunar-eclipse") {
        createLunarEclipseScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Lunar Eclipse</h2>
            <p>
                A lunar eclipse occurs when the <b>Earth</b> passes directly between the <b>Sun</b> and the <b>Moon</b>.
            </p>
            <p>
                Earth blocks sunlight from reaching the Moon. Instead of going pitch black, the Moon often turns a deep red (Blood Moon) because Earth's atmosphere bends sunlight into the shadow.
            </p>
            <p>
                This alignment can only happen during a <b>Full Moon</b> phase.
            </p>
        `;
    }

    const toggleBtn = textDiv.querySelector(".lesson-toggle-btn");
    const extra = textDiv.querySelector(".lesson-extra");

    toggleBtn.addEventListener("click", () => {
        extra.classList.toggle("expanded");

        toggleBtn.textContent =
            extra.classList.contains("expanded")
                ? "Show Less"
                : "Show More";
    });
}

function closeLesson() {
    cleanupScene();
    document.getElementById("learn-detail").classList.add("hidden");
    document.getElementById("learn-home").classList.remove("hidden");
}

function cleanupScene() {
    if (currentAnimationFrame) cancelAnimationFrame(currentAnimationFrame);
    if (currentRenderer) {
        currentRenderer.dispose();
        currentRenderer.domElement.remove();
        currentRenderer = null;
    }
}

function createBaseScene(container) {
    const scene = new THREE.Scene();

    // UPDATED: Get dynamic dimensions from the CSS-styled container
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(
        50,
        width / height,
        0.1,
        1000
    );

    // Look from a slight angle to see the alignment clearly
    camera.position.set(0, 8, 22);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    currentRenderer = renderer;

    // Handle Window Resize for the specific container
    let resizeTimeout;

    const resizeObserver = new ResizeObserver(() => {
        if (!currentRenderer) return;

        clearTimeout(resizeTimeout);

        resizeTimeout = setTimeout(() => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            currentRenderer.setSize(newWidth, newHeight);
        }, 50);   // small debounce
    });

    resizeObserver.observe(container);

    return { scene, camera, renderer };
}

/* ========================================================
   SCENE 1: SOLAR ECLIPSE (Sun -> Moon -> Earth)
   ======================================================== */
function createSolarEclipseScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // 1. SUN (Moved far left to avoid collision)
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(6, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    sun.position.set(-16, 0, 0);
    scene.add(sun);

    // Light Source (Inside Sun)
    const sunLight = new THREE.PointLight(0xffffff, 18, 300);
    sunLight.position.copy(sun.position);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);

    // Ambient
    scene.add(new THREE.AmbientLight(0x404040, 0.3));

    // 2. EARTH (Center)
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        new THREE.MeshStandardMaterial({
            color: 0x2266ff,
            roughness: 0.7
        })
    );
    earth.receiveShadow = true;
    scene.add(earth);

    // 3. MOON (Orbiting)
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 64, 64),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
    );
    moon.castShadow = true;
    scene.add(moon);

    // 4. SHADOW CONE (Visual Aid)
    const shadowCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.65, 8, 32, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    // Orient cone to point down initially (we will rotate it in animate)
    shadowCone.geometry.translate(0, -4, 0);
    shadowCone.geometry.rotateX(-Math.PI / 2);
    scene.add(shadowCone);

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.0008;

        // Moon Orbit (Circular)
        moon.position.x = 6 * Math.cos(t);
        moon.position.z = 6 * Math.sin(t);

        // Update Shadow Cone (From Moon, pointing away from Sun)
        shadowCone.position.copy(moon.position);

        const dir = new THREE.Vector3().subVectors(moon.position, sun.position).normalize();
        const target = new THREE.Vector3().copy(moon.position).add(dir);
        shadowCone.lookAt(target);

        renderer.render(scene, camera);
    }
    animate();
}

/* ========================================================
   SCENE 2: LUNAR ECLIPSE (Sun -> Earth -> Moon)
   ======================================================== */
function createLunarEclipseScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // 1. SUN (Added as requested)
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    sun.position.set(-16, 0, 0); // Far Left
    scene.add(sun);

    // Light Source
    const sunLight = new THREE.PointLight(0xffffff, 2.5, 300);
    sunLight.position.copy(sun.position);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0x404040, 0.2));

    // 2. EARTH (Center - Casters Shadow)
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        new THREE.MeshStandardMaterial({
            color: 0x2244aa,
            roughness: 0.8
        })
    );
    earth.castShadow = true;
    earth.receiveShadow = true;
    scene.add(earth);

    // 3. MOON (Orbiting - Receives Shadow)
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 64, 64),
        new THREE.MeshStandardMaterial({ color: 0xaa4444 }) // Red hue for eclipse effect
    );
    moon.castShadow = true;
    moon.receiveShadow = true; // Crucial for seeing the eclipse!
    scene.add(moon);

    // 4. EARTH'S UMBRA (Visual Aid)
    const umbraGeom = new THREE.ConeGeometry(2.05, 15, 32, 1, true);
    umbraGeom.translate(0, -7.5, 0); // Shift so base is at Earth
    umbraGeom.rotateX(-Math.PI / 2); // Point towards +X

    const umbra = new THREE.Mesh(
        umbraGeom,
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    scene.add(umbra);

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.0008;

        // Wide Orbit for Lunar Eclipse
        moon.position.x = 9 * Math.cos(t);
        moon.position.z = 9 * Math.sin(t);

        // Umbra always points away from Sun (which is fixed at -16)
        umbra.lookAt(50, 0, 0);

        renderer.render(scene, camera);
    }
    animate();
}