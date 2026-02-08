const ASSET_BASE = "./frontend/public/";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { loadInfoCard } from "./infoCard.js";
import { fetchMoonData } from "./api.js";

window.addEventListener("error", e => {
    console.error("GLOBAL ERROR:", e.message);
    document.getElementById("loader")?.remove();
});


// ============================== LOGIC CONTROLLER ==============================
let targetPhaseAngle = 0;     // from backend (degrees)
let visualPhaseAngle = 0;     // smoothed (degrees)
const PHASE_LERP_SPEED = 0.05;
// ============================== LOGIC CONTROLLER ==============================
function updateMoonCards(data) {
    if (!data) return;

    const d = new Date(data.date);

    // ---------------- DATE ----------------
    document.getElementById("date-day").textContent = d.getDate();
    document.getElementById("date-month").textContent =
        d.toLocaleString("default", { month: "long", year: "numeric" });
    document.getElementById("date-weekday").textContent =
        data.day || d.toLocaleString("default", { weekday: "long" });

    // ---------------- PHASE ----------------
    document.getElementById("ui-phase").textContent = data.phase;
    document.getElementById("ui-illum").textContent = `${data.illumination}%`;
    document.getElementById("ui-age").textContent = `${data.age} days`;

    // ---------------- PANCHANG ----------------
    document.getElementById("ui-tithi").textContent = data.phase;
    document.getElementById("ui-paksha").textContent = data.paksha;
    document.getElementById("ui-nakshatra").textContent = data.constellation;

    // ---------------- PHYSICS ----------------
    document.getElementById("ui-distance").textContent =
        `${data.distance_km.toLocaleString()} km`;

    // ---------------- PHASE → LIGHT ----------------
    // backend sends phase_angle in degrees (0–360)
    if (typeof data.phase_angle === "number") {
        targetPhaseAngle = data.phase_angle % 360;
    }
}
// ================= SIMULATION TIME ================= 
// Date Logic
let realToday = new Date();          // today, never auto-advances
let simDate = new Date(realToday);  // simulation clock  
const BACKEND_SYNC_MS = 60 * 1000; // sync every 1 simulated minute
let lastBackendSyncMs = 0;
const dateInput = document.getElementById("date-input");
let timeScale = 1;           // required by animation loop
let isTimePaused = false;
let currentDate = new Date(); // UI reference date
const MS_PER_REAL_SECOND = 1000;      // real milliseconds
const MS_PER_SIM_SECOND = 1000;       // 1× = real-time

async function loadMoonForDate(dateObj) {
    try {
        const iso = dateObj.toISOString().slice(0, 10);
        const data = await fetchMoonData(iso);
        updateMoonCards(data);
    } catch (e) {
        console.error("API Error:", e);
    }
}

// Event Listeners for Date Picker
document.getElementById("open-date-picker").onclick = () => {
    document.getElementById("date-display").classList.add("hidden");
    document.getElementById("date-picker").classList.remove("hidden");
    // dateInput.valueAsDate = currentDate;
    if (dateInput) dateInput.valueAsDate = currentDate;
};

document.getElementById("cancel-date").onclick = () => {
    document.getElementById("date-picker").classList.add("hidden");
    document.getElementById("date-display").classList.remove("hidden");
};

document.getElementById("apply-date").onclick = async () => {
    if (!dateInput.value) return;

    const lunarDate = new Date(dateInput.value);
    await loadMoonForDate(lunarDate);

    document.getElementById("date-picker").classList.add("hidden");
    document.getElementById("date-display").classList.remove("hidden");

    // 🔥 RESET TO HERO VIEW
    if (isMobile) {
        const moonSheet = document.getElementById("moon-sheet");
        moonSheet.scrollTop = 0;
        moonSheet.style.height = "18vh";

        const visual = document.querySelector(".lunar-visual");
        if (visual) visual.style.filter = "none";
    }
};



/* =====================================================
THREE.JS ENGINE
===================================================== */
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.style.zIndex = "0";
document.body.appendChild(renderer.domElement);

const clock = new THREE.Clock();

/* =====================================================
CAMERA & STATE
===================================================== */
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 15000);

let theta = Math.PI / 4;
let phi = Math.PI / 3;
let targetRadius = 180;
let currentRadius = 200;
let targetTheta = Math.PI / 4;
let targetPhi = Math.PI / 3;
const targetPos = new THREE.Vector3(0, 0, 0);
const currentTargetPos = new THREE.Vector3(0, 0, 0);

let cameraMode = "default";
const DEFAULT_RADIUS = 180;
const DEFAULT_MIN_RADIUS = 60;
const DEFAULT_MAX_RADIUS = 2000;
let focusMinRadius = 14;
let focusMaxRadius = 120;
let uiPage = "solar";
let focusObject = null;
let solarPaused = false;
let isMobile = window.innerWidth < 768;
const MOON_SCALE = isMobile ? 35 : 40;
const LUNAR_OFFSET_DESKTOP = new THREE.Vector3(9, 0, 0);
const LUNAR_OFFSET_MOBILE = new THREE.Vector3(0, 0, 0);
const lunarFrameOffset = new THREE.Vector3();
const MOON_BASE_SCALE = 2.5;


/* =====================================================
LIGHTING
===================================================== */

// ============ Lighting for differen scenarious ===========
// ================= LIGHTING PRESETS =================
const SOLAR_LIGHTING = {
    ambient: 0.35,
    sun: 18,
};

const LUNAR_LIGHTING = {
    ambient: 0.12,
    sun: 0,
    lunar: 6,
};

const ambient = new THREE.AmbientLight(0xffffff, SOLAR_LIGHTING.ambient);
scene.add(ambient);

const hemi = new THREE.HemisphereLight(
    0xffffff,   // sky
    0x222233,   // ground
    0.6
);
scene.add(hemi);


const sunLight = new THREE.PointLight(0xffffff, SOLAR_LIGHTING.sun, 5000);
sunLight.decay = 2;
sunLight.distance = 2000;
sunLight.intensity = 25;
scene.add(sunLight);

const lunarSpotlight = new THREE.DirectionalLight(0xffffff, 6);
lunarSpotlight.castShadow = false;
lunarSpotlight.position.set(15, 5, 10);
scene.add(lunarSpotlight);
lunarSpotlight.visible = false;


const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(6000 * 3);
for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 10000;
starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 1, color: 0xffffff, sizeAttenuation: false }));
scene.add(stars);

/* =====================================================
SYSTEM SETUP
===================================================== */
const loader = new THREE.TextureLoader();

const tex = (f) => {
    const t = loader.load(`${ASSET_BASE}textures/${f}`);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
};

const PLANETS = {
    Mercury: { a: 0.387, e: 0.205, w: 77.46, period: 0.241 },
    Venus: { a: 0.723, e: 0.007, w: 131.57, period: 0.615 },
    Earth: { a: 1.000, e: 0.017, w: 102.94, period: 1.0 },
    Mars: { a: 1.524, e: 0.093, w: 336.04, period: 1.881 },
    Jupiter: { a: 5.203, e: 0.049, w: 14.75, period: 11.86 },
    Saturn: { a: 9.537, e: 0.054, w: 92.43, period: 29.46 },
    Uranus: { a: 19.19, e: 0.047, w: 170.96, period: 84.01 },
    Neptune: { a: 30.07, e: 0.009, w: 44.97, period: 164.8 }
};
// ================= MOON ORBIT PARAMS =================
const MOON_ORBIT = {
    radius: 2.2,
    periodDays: 27.3217,
};

let moonAngle = Math.random() * Math.PI * 2;

const planetMeshes = {};
const planetAngles = {};
const orbitLines = [];

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(22, 64, 64),
    new THREE.MeshStandardMaterial({
        map: tex("sun.jpg"),
        roughness: 1,
        metalness: 0
    })
);

sun.userData.id = "sun";
scene.add(sun);
planetMeshes.sun = sun;
console.log("Sun position:", sun.position);

for (const name in PLANETS) {
    const p = PLANETS[name];
    const mat = name === "Earth"
        ? new THREE.MeshStandardMaterial({ map: tex("earth-day.jpg"), emissiveMap: tex("earth-night.jpg"), emissiveIntensity: 0.7 })
        : new THREE.MeshStandardMaterial({ map: tex(`${name.toLowerCase()}.jpg`) });

    // const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r, 48, 48), mat);
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(p.r || 1, 48, 48), mat);
    mesh.userData.id = name.toLowerCase();
    scene.add(mesh);

    const PLANET_SIZE_SCALE = 4;
    mesh.scale.setScalar(PLANET_SIZE_SCALE);
    // mesh.scale.multiplyScalar(2.5);
    planetMeshes[name] = mesh;
    planetAngles[name] = Math.random() * Math.PI * 2;
    if (name === "Earth") {
        const moon = new THREE.Mesh(
            new THREE.SphereGeometry(0.27, 48, 48),
            new THREE.MeshStandardMaterial({
                map: tex("moon.jpg"),
                roughness: 1,
                metalness: 0
            })
        );

        moon.userData.id = "moon";
        moon.position.set(2.2, 0, 0);
        moon.scale.setScalar(MOON_BASE_SCALE / PLANET_SIZE_SCALE);

        mesh.add(moon);
        planetMeshes.moon = moon;
    }
    const { a, e } = PLANETS[name];
    const orbit = createCircularOrbit(p.a);
    scene.add(orbit);
    orbitLines.push(orbit);
}

const infoCard = document.getElementById("info-card");
if (infoCard) infoCard.addEventListener("wheel", (e) => e.stopPropagation(), { passive: true });
Object.values(planetMeshes).forEach(m => m.visible = true);

// ================= TIME CONTROL (DISCRETE STEPS) =================
const TIME_STEPS = [
    { label: "Paused", scale: 0 },
    { label: "1×", scale: 1 },
    { label: "5×", scale: 500 },
    { label: "10×", scale: 1000 },
    { label: "50×", scale: 5000 },
    { label: "100×", scale: 10000 },
    { label: "Fast", scale: 50000 },
    { label: "Warp", scale: 200000 },
];

let timeIndex = 1; // starts at 1×

const timeLabel = document.getElementById("time-label");

function updateTime() {
    timeScale = TIME_STEPS[timeIndex].scale;
    timeLabel.textContent = TIME_STEPS[timeIndex].label;
    isTimePaused = timeScale === 0;
}
function realignMoonPhaseImmediately() {
    if (!planetMeshes.moon) return;

    // Force visual phase = target phase
    visualPhaseAngle = targetPhaseAngle;

    const rad = THREE.MathUtils.degToRad(visualPhaseAngle - 90);

    const lightDir = new THREE.Vector3(
        Math.cos(rad),
        0,
        Math.sin(rad)
    );

    lunarSpotlight.position.copy(lightDir.multiplyScalar(50));
    lunarSpotlight.target.position.set(0, 0, 0);
    lunarSpotlight.target.updateMatrixWorld();
}


async function resetSimulationToNow() {
    // 1. Reset clocks
    const now = new Date();
    realToday = new Date(now);
    simDate = new Date(now);
    currentDate = new Date(now);

    // 2. Reset time scale to 1×
    timeIndex = 1;
    updateTime();

    // 3. Reset backend sync timer
    lastBackendSyncMs = 0;

    // 4. Reset Moon rotation + phase (PART 2 explains this)
    // 4. Reset Moon orientation (but NOT light!)
    if (planetMeshes.moon) {
        planetMeshes.moon.rotation.set(0, 0, 0);
    }

    // Reset phase smoothly but realign lighting immediately
    visualPhaseAngle = targetPhaseAngle;
    realignMoonPhaseImmediately();


    // 5. Fetch authoritative solar positions for NOW
    await loadSolarForDate(simDate);

    // 6. Update UI date immediately
    const solarDateEl = document.getElementById("solar-date");
    if (solarDateEl) {
        solarDateEl.textContent = simDate.toDateString();
    }

    console.log("✅ Reset to current date & time:", simDate.toString());
}



document.getElementById("time-up").onclick = () => {
    timeIndex = Math.min(timeIndex + 1, TIME_STEPS.length - 1);
    updateTime();
};

document.getElementById("time-down").onclick = () => {
    timeIndex = Math.max(timeIndex - 1, 0);
    updateTime();
};

// initialize
updateTime();

/* =====================================================
INPUT HANDLING (FIXED ROTATION & DOUBLE CLICK)
===================================================== */
let isMouseDown = false;
let touchStart = { x: 0, y: 0 };
let touchCurrent = { x: 0, y: 0 };
let lastTouchDist = 0; // For pinch zoom
let isPinching = false;
let isDragging = false;
let draggingMoon = false;
let lastX = 0, lastY = 0;
let lastTap = 0;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const canvas = renderer.domElement;

canvas.style.touchAction = "none";

// 1. Mouse Down: PREPARE TO DRAG
canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isMouseDown = true;
    isDragging = false; // Reset drag state
    lastX = e.clientX;
    lastY = e.clientY;

    // Check if we are clicking on Moon in Lunar mode
    if (cameraMode === "lunar" && planetMeshes.moon) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects([planetMeshes.moon], true);
        if (hits.length > 0) draggingMoon = true;
    }
});

window.addEventListener("blur", () => {
    isMouseDown = false;
    isDragging = false;
    draggingMoon = false;
});


// 2. Mouse Up: RESET STATE
canvas.addEventListener("mouseup", () => {
    isMouseDown = false;
    draggingMoon = false;
    // Note: We don't do focus here anymore, we use dblclick
});
canvas.addEventListener("mouseleave", () => {
    isMouseDown = false;
    draggingMoon = false;
    isDragging = false;
});

// 3. Mouse Move: HANDLE ROTATION
canvas.addEventListener("mousemove", (e) => {
    // Cursor Logic
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    if (!isMouseDown) {
        // Just hovering? Show pointer if over object
        const hits = raycaster.intersectObjects(Object.values(planetMeshes), true);
        let validHit = false;
        for (const h of hits) {
            if (h.object.visible) {
                let o = h.object;
                while (o.parent && !o.userData.id) o = o.parent;
                if (o.userData.id) { validHit = true; break; }
            }
        }
        document.body.style.cursor = validHit ? "pointer" : "default";
        return;
    }

    // If mouse is down and moving, we are dragging
    isDragging = true;

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;

    if (cameraMode === "lunar" && draggingMoon) {
        planetMeshes.moon.rotation.y += dx * 0.007;
    } else if (cameraMode !== "lunar") {
        // Update TARGETS instead of actual values to allow smoothing
        targetTheta -= dx * 0.005;
        targetPhi -= dy * 0.005;

        // Clamp the target immediately so we don't flip over
        targetPhi = THREE.MathUtils.clamp(targetPhi, 0.1, Math.PI - 0.1);
    }
    lastX = e.clientX;
    lastY = e.clientY;
});

// 4. Double Click: FOCUS LOGIC
canvas.addEventListener("dblclick", (e) => {
    if (uiPage !== "solar") return;

    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(Object.values(planetMeshes), true);

    if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !obj.userData.id) obj = obj.parent;

        if (obj.userData.id) {
            focusOn(obj);
        }
    } else {
        exitFocus();
    }
});


window.addEventListener("wheel", (e) => {
    if (uiPage === "lunar") return;
    targetRadius *= 1 + e.deltaY * 0.001;
    const min = cameraMode === "focus" ? focusMinRadius : DEFAULT_MIN_RADIUS;
    const max = cameraMode === "focus" ? focusMaxRadius : DEFAULT_MAX_RADIUS;
    targetRadius = THREE.MathUtils.clamp(targetRadius, min, max);
});

//  ====================== touch controls =====================
/* =====================================================
    MOBILE TOUCH HANDLING (New)
===================================================== */

canvas.addEventListener("touchstart", (e) => {
    // 1 Finger Interaction
    if (e.touches.length === 1) {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // ms

        // Check if this tap is close in time to the last one
        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // --- DOUBLE TAP DETECTED! ---
            e.preventDefault(); // Stop browser zoom
            handleInputFocus(e.touches[0].clientX, e.touches[0].clientY);
            lastTap = 0; // Reset
        } else {
            // Single Tap (start rotating)
            lastTap = now;
            isDragging = true;
            isPinching = false;
            touchStart.x = e.touches[0].clientX;
            touchStart.y = e.touches[0].clientY;
        }
    }
    // 2 Fingers: Pinch Zoom
    else if (e.touches.length === 2) {
        isDragging = false;
        isPinching = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDist = Math.sqrt(dx * dx + dy * dy);
    }
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault(); // Prevent scrolling the webpage while rotating 3D

    // 1. Rotation logic
    if (e.touches.length === 1 && !isPinching) {
        const dx = e.touches[0].clientX - touchStart.x;
        const dy = e.touches[0].clientY - touchStart.y;

        // Sensitivity multiplier
        const SENSITIVITY = 0.005;

        if (cameraMode === "lunar") {
            // Rotate moon directly
            if (planetMeshes.moon) planetMeshes.moon.rotation.y += dx * SENSITIVITY;
        } else {
            // Orbit camera
            targetTheta -= dx * SENSITIVITY;
            targetPhi -= dy * SENSITIVITY;

            // Clamp Phi to prevent flipping
            targetPhi = THREE.MathUtils.clamp(targetPhi, 0.1, Math.PI - 0.1);
        }

        // Update last position for next frame
        touchStart.x = e.touches[0].clientX;
        touchStart.y = e.touches[0].clientY;
    }

    // 2. Pinch Zoom logic
    if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.sqrt(dx * dx + dy * dy);

        // Calculate zoom factor
        const delta = lastTouchDist - currentDist;
        const zoomSpeed = 0.5;

        targetRadius += delta * zoomSpeed;

        // Clamp radius
        const min = cameraMode === "focus" ? focusMinRadius : DEFAULT_MIN_RADIUS;
        const max = cameraMode === "focus" ? focusMaxRadius : DEFAULT_MAX_RADIUS;
        targetRadius = THREE.MathUtils.clamp(targetRadius, min, max);

        lastTouchDist = currentDist;
    }
}, { passive: false });

canvas.addEventListener("touchend", () => {
    isDragging = false;
    isPinching = false;
});
function handleInputFocus(clientX, clientY) {
    if (uiPage !== "solar") return;

    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(Object.values(planetMeshes), true);

    if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj.parent && !obj.userData.id) obj = obj.parent;

        if (obj.userData.id) {
            focusOn(obj);
        }
    } else {
        exitFocus();
    }
}

const modeDock = document.querySelector(".mode-switch-container");
const sheetModes = document.querySelector(".sheet-modes");
if (modeDock) {
    modeDock.classList.add("floating");
}
const lunarCards = document.querySelector(".lunar-cards");

if (lunarCards) {
    lunarCards.addEventListener("scroll", () => {
        // If user scrolls down just a tiny bit (5px), expand the sheet
        if (lunarCards.scrollTop > 5) {
            lunarCards.classList.add("scrolled");
        }
        // If user scrolls back to the very top, shrink the sheet back to peaking
        else if (lunarCards.scrollTop === 0) {
            lunarCards.classList.remove("scrolled");
        }
    });
}

// -----------------------------------------------------
// SCENE HELPERS
// -----------------------------------------------------
const moonSheet = document.getElementById("moon-sheet");
let sheetExpanded = false;
if (moonSheet) {
    moonSheet.addEventListener("scroll", () => {
        const visual = document.querySelector(".lunar-visual");
        if (visual) {
            if (moonSheet.scrollTop > 50) visual.style.filter = "blur(15px) brightness(0.5)";
            else visual.style.filter = "none";
        }
    });
}

function updateModeButtons(activeId) {
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('active', btn.id === activeId));
}

const lunarBtn = document.getElementById("lunar-mode-btn");
if (lunarBtn) {
    lunarBtn.addEventListener("click", () => {
        if (uiPage === "lunar") return;
        uiPage = "lunar";
        cameraMode = "lunar";
        updateModeButtons("lunar-mode-btn");
        enterLunarScene();
        document.getElementById("env-gradient").classList.add("lunar");
        // document.getElementById("page-transition").classList.add("active");
        const hint = document.querySelector(".ui-hint");
        if (hint) hint.style.opacity = 0;
        setTimeout(() => { const moonMode = document.getElementById("moon-mode"); if (moonMode) moonMode.classList.remove("hidden"); }, 300);
    });
}

const solarBtn = document.getElementById("solar-mode-btn");
if (solarBtn) {
    solarBtn.addEventListener("click", () => {
        // Force the reset logic
        resetToSolar();

        // Ensure button states update
        updateModeButtons("solar-mode-btn");

        // Double check UI Page state
        uiPage = "solar";
    });
}

const resetBtn = document.getElementById("reset-view");
if (resetBtn) {
    resetBtn.addEventListener("click", async () => {

        // Pause time briefly (visual clarity)
        isTimePaused = true;

        // Reset camera + UI
        resetToSolar();
        updateModeButtons("solar-mode-btn");

        // Reset simulation state
        await resetSimulationToNow();

        // Resume time
        isTimePaused = false;
    });
}



function resetToSolar() {
    console.log("RESET TO SOLAR");

    // 1. Reset State Flags
    uiPage = "solar";
    cameraMode = "default";
    solarPaused = false;
    lunarIntro = false; // FIX: Stop any running lunar intro animation

    // 2. CSS & UI Cleanup
    document.body.classList.remove("lunar-active");
    document.body.classList.remove("focused");
    document.getElementById("env-gradient").classList.remove("lunar");
    document.getElementById("focus-overlay")?.classList.remove("active");

    // 3. Hide Lunar UI immediately
    const moonMode = document.getElementById("moon-mode");
    if (moonMode) moonMode.classList.add("hidden");

    // 4. Reset Camera & 3D Scene
    updateResetButton("solar");
    exitLunarScene();     // Moves moon back to Earth
    exitFocus();          // Clears focus target
    smoothResetCamera();  // Resets camera angle

    // 5. Restore Solar UI Hints
    const hint = document.querySelector(".ui-hint");
    if (hint) hint.style.opacity = 1;
}


function setSystemVisibility(visible) {
    planetMeshes.sun.visible = visible;
    for (const name in PLANETS) planetMeshes[name].visible = visible;
    orbitLines.forEach(o => o.visible = visible);
}

function focusOn(obj) {
    if (cameraMode === "lunar") return;

    cameraMode = "focus";
    focusObject = obj;
    solarPaused = true;

    loadInfoCard(obj.userData.id);

    const r = obj.geometry.boundingSphere.radius;
    focusMinRadius = Math.max(20, r * 4);
    focusMaxRadius = r * 40;
    targetRadius = r * 12;

    // 🔹 Pretty name
    document.getElementById("focus-name").textContent =
        obj.userData.id === "moon" ? "MOON" : obj.userData.id.toUpperCase();

    infoCard.classList.remove("hidden");
    document.getElementById("focus-indicator").classList.remove("hidden");
    document.getElementById("focus-overlay").classList.add("active");
    document.body.classList.add("focused");
}

function exitFocus() {

    cameraMode = "default";
    focusObject = null;
    solarPaused = false;

    setSystemVisibility(true);

    document.getElementById("info-card")?.classList.add("hidden");
    document.getElementById("focus-indicator").classList.add("hidden");
    document.getElementById("focus-overlay").classList.remove("active");

    document.body.classList.remove("focused");
}


const toggleBtn = document.getElementById("toggle-details");
const closeBtn = document.getElementById("close-card");

toggleBtn?.addEventListener("click", () => {
    infoCard.classList.toggle("expanded");
    infoCard.classList.toggle("collapsed");

    toggleBtn.textContent =
        infoCard.classList.contains("expanded")
            ? "Hide Telemetry"
            : "View Telemetry";
});

closeBtn?.addEventListener("click", () => {
    // 1. If in Lunar mode, exit back to Solar System
    resetToSolar();
    if (uiPage === "lunar") {
        resetToSolar();
        return;
    }

    // 2. If focused on a specific planet, exit focus (this automatically hides the card)
    if (cameraMode === "focus") {
        exitFocus();
        return;
    }

    // 3. If just viewing the card in default mode, JUST hide the card, don't reset camera
    infoCard.classList.add("hidden");
    const toggleBtn = document.getElementById("toggle-details");
    if (toggleBtn) toggleBtn.textContent = "View Telemetry"; // Reset toggle text
});


// ============ Logic for transforming reset to exit ==============
function updateResetButton(mode) {
    const label = document.getElementById("reset-label");

    if (!label) return;

    if (mode === "solar") {
        label.textContent = "Reset View";
    } else if (mode === "lunar") {
        label.textContent = "Exit Observatory";
    } else if (mode === "learn") {
        label.textContent = "Back to Scene";
    }
}



function setCanvasInteraction(enabled) {
    renderer.domElement.style.pointerEvents = enabled ? "auto" : "none";
}
function smoothResetCamera() {
    cameraMode = "default";
    focusObject = null;
    solarPaused = false;

    // Reset Target to Sun Center
    targetPos.set(0, 0, 0);
    currentTargetPos.set(0, 0, 0);

    // FIX: Set TARGET angles, allowing the animate loop to glide there
    targetTheta = Math.PI / 4;
    targetPhi = Math.PI / 3;

    // CRITICAL FIX: Ensure we are far enough away!
    targetRadius = DEFAULT_RADIUS; // 180

    // If we are "inside" the sun (radius < 50), jump radius immediately 
    // (angles will still smooth-transition)
    if (currentRadius < 50) {
        currentRadius = DEFAULT_RADIUS;
    } else {
        // Otherwise smooth transition for radius too
        currentRadius = DEFAULT_RADIUS * 1.2;
    }
}

// ================= Function to change the lighting ==============
function applySolarLighting() {
    ambient.intensity = SOLAR_LIGHTING.ambient;
    hemi.intensity = 0.6;
    sunLight.intensity = SOLAR_LIGHTING.sun;
    lunarSpotlight.visible = false;
}
function applyLunarLighting() {
    ambient.intensity = 0.05;   // almost zero
    hemi.intensity = 0;         // IMPORTANT
    sunLight.intensity = 0;
    lunarSpotlight.visible = true;
}



// LUNAR SCENE HELPERS
let lunarIntro = false;
let lunarIntroProgress = 0;

function enterLunarScene() {
    if (!planetMeshes.moon) return;
    scene.attach(planetMeshes.moon);
    planetMeshes.moon.scale.setScalar(MOON_SCALE);

    setSystemVisibility(false);
    sunLight.visible = false;
    lunarSpotlight.visible = true;
    lunarFrameOffset.copy(isMobile ? LUNAR_OFFSET_MOBILE : LUNAR_OFFSET_DESKTOP);
    planetMeshes.moon.position.set(0, 0, 0);
    targetPos.set(0, 0, 0);
    currentTargetPos.set(0, 0, 0);

    planetMeshes.moon.rotation.set(0, 0, 0);
    planetMeshes.moon.visible = true;
    planetMeshes.moon.material.transparent = true;
    planetMeshes.moon.material.opacity = 0;

    document.body.classList.add("lunar-active");
    lunarIntro = true;
    lunarIntroProgress = 0;
    cameraMode = "lunar";
    solarPaused = true;
    document.getElementById("info-card")?.classList.add("hidden");
    document.body.classList.remove("focused");
    updateResetButton("lunar");
    applyLunarLighting();

    targetTheta = Math.PI / 2;
    targetPhi = Math.PI / 2;

    // --- FIX 1: TASTEFUL ZOOM ---
    // Increased from 35/45 to 90/110 to give the Moon breathing room
    if (isMobile) {
        targetRadius = 55;
        currentRadius = 70;
    } else {
        targetRadius = 40;
        currentRadius = 90;
    }

}

function exitLunarScene() {
    // FIX: Ensure we reset opacity even if we think we aren't in lunar mode
    if (planetMeshes.moon) {
        planetMeshes.moon.material.transparent = false;
        planetMeshes.moon.material.opacity = 1;
    }

    if (!planetMeshes.moon || !planetMeshes.Earth) return;

    document.body.classList.remove("lunar-active");

    // Re-parent Moon to Earth
    planetMeshes.Earth.add(planetMeshes.moon);
    planetMeshes.moon.position.set(2.2, 0, 0);
    planetMeshes.moon.scale.setScalar(MOON_BASE_SCALE / 4);

    // Lighting & Visibility
    sunLight.visible = true;
    lunarSpotlight.visible = false;
    setSystemVisibility(true);

    cameraMode = "default";


    applySolarLighting();
}
/* =====================================================
ANIMATION LOOP
===================================================== */
function animate() {
    requestAnimationFrame(animate);

    // ---------------- CAMERA TARGET ----------------
    if (cameraMode === "focus" && focusObject) {
        focusObject.getWorldPosition(targetPos);
    } else if (cameraMode === "lunar") {
        targetPos.copy(lunarFrameOffset);
    } else {
        targetPos.set(0, 0, 0);
    }
    if (
        cameraMode === "lunar" &&
        !lunarIntro &&
        !isDragging &&
        (!isMobile || !sheetExpanded)
    ) {
        planetMeshes.moon.rotation.y += 0.0004;
    }


    sunLight.position.copy(sun.position);
    sun.material.emissiveIntensity =
        0.35 + Math.sin(performance.now() * 0.001) * 0.1;
    // ---------------- SIMULATION CLOCK ----------------
    // const deltaSeconds = clock.getDelta();
    const deltaSeconds = clock.getDelta();

    let deltaSimMs = 0;

    // ... inside animate() ...

    if (!isTimePaused && timeScale > 0) {
        deltaSimMs = deltaSeconds * MS_PER_SIM_SECOND * timeScale;
        simDate = new Date(simDate.getTime() + deltaSimMs);

        // --- NEW: ANIMATE PLANETS LOCALLY ---
        // 1 Year in ms = 365.25 * 24 * 60 * 60 * 1000 ≈ 3.15576e10
        const MS_IN_YEAR = 3.15576e10;

        // If we are in Solar view, move the planets
        if (uiPage === "solar" && cameraMode !== "lunar") {
            for (const name in PLANETS) {
                const p = PLANETS[name];
                const mesh = planetMeshes[name];

                if (mesh && planetAngles[name] !== undefined) {
                    // Calculate angle change based on orbital period
                    // fast planets (low period) move more, slow planets (high period) move less
                    const angleChange = (deltaSimMs / MS_IN_YEAR) * (Math.PI * 2) / p.period;

                    planetAngles[name] += angleChange;

                    // Update Position using your existing orbit logic
                    const r = mapDistanceAU(p.a);
                    const theta = planetAngles[name];

                    mesh.position.set(
                        r * Math.cos(theta),
                        0,
                        r * Math.sin(theta)
                    );
                }
            }
        }
        // ---------------- MOON ORBIT AROUND EARTH ----------------
        if (
            planetMeshes.moon &&
            planetMeshes.Earth &&
            uiPage === "solar" &&
            cameraMode !== "lunar"
        ) {
            const MS_IN_DAY = 24 * 60 * 60 * 1000;
            const deltaDays = deltaSimMs / MS_IN_DAY;

            // Advance orbital angle
            moonAngle += (2 * Math.PI / MOON_ORBIT.periodDays) * deltaDays;

            // Moon position relative to Earth
            planetMeshes.moon.position.set(
                MOON_ORBIT.radius * Math.cos(moonAngle),
                0,
                MOON_ORBIT.radius * Math.sin(moonAngle)
            );

            // -------- TIDAL LOCKING --------
            planetMeshes.moon.lookAt(
                planetMeshes.Earth.position.clone()
                    .sub(planetMeshes.moon.getWorldPosition(new THREE.Vector3()))
            );
        }

    }


    const solarDateEl = document.getElementById("solar-date");

    if (uiPage === "solar" && solarDateEl) {
        solarDateEl.textContent = simDate.toDateString();
    }

    // ---------------- BACKEND SYNC ----------------
    lastBackendSyncMs += deltaSimMs;

    if (lastBackendSyncMs >= BACKEND_SYNC_MS) {
        lastBackendSyncMs = 0;
        loadSolarForDate(simDate);
    }

    // ---------------- MOON INTRO ----------------

    if (cameraMode === "lunar" && lunarIntro) {
        lunarIntroProgress += 0.02;
        const t = Math.min(lunarIntroProgress, 1);
        const ease = 1 - Math.pow(1 - t, 3);

        planetMeshes.moon.material.opacity = ease;
        planetMeshes.moon.scale.setScalar(MOON_SCALE);

        if (t >= 1) {
            planetMeshes.moon.material.opacity = 1;
            lunarIntro = false;
        }
    }

    // ---------------- MOON PHASE LIGHTING ----------------
    if (cameraMode === "lunar") {
        // Smooth phase transition
        visualPhaseAngle = THREE.MathUtils.lerp(
            visualPhaseAngle,
            targetPhaseAngle,
            PHASE_LERP_SPEED
        );

        const rad = THREE.MathUtils.degToRad(visualPhaseAngle - 90);

        // Sun direction relative to Moon
        const lightDir = new THREE.Vector3(
            Math.cos(rad),
            0,
            Math.sin(rad)
        );

        lunarSpotlight.position.copy(lightDir.multiplyScalar(50));
        lunarSpotlight.target.position.set(0, 0, 0);
        lunarSpotlight.target.updateMatrixWorld();
    }

    // ---------------- MOON ROTATION ----------------
    if (cameraMode === "lunar" && !lunarIntro && !isDragging) {
        planetMeshes.moon.rotation.y += 0.0004;
    }

    // ---------------- CAMERA SMOOTHING ----------------
    const lerpFactor = isDragging ? 0.6 : 0.05;

    currentTargetPos.lerp(targetPos, lerpFactor);
    currentRadius = THREE.MathUtils.lerp(currentRadius, targetRadius, lerpFactor);

    // NEW: Smoothly interpolate angles
    theta = THREE.MathUtils.lerp(theta, targetTheta, lerpFactor);
    phi = THREE.MathUtils.lerp(phi, targetPhi, lerpFactor);

    // Keep clamp for safety (though targets are already clamped)
    if (cameraMode !== "lunar") {
        phi = THREE.MathUtils.clamp(phi, 0.1, Math.PI - 0.1);
    }

    const x = currentTargetPos.x + currentRadius * Math.sin(phi) * Math.cos(theta);
    const y = currentTargetPos.y + currentRadius * Math.cos(phi);
    const z = currentTargetPos.z + currentRadius * Math.sin(phi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(currentTargetPos);

    renderer.render(scene, camera);
}
animate();


window.addEventListener("resize", () => {
    // 1. Update Mobile State
    isMobile = window.innerWidth < 768;

    // 2. Update Camera & Renderer
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 3. Update Moon Scale based on new state
    if (planetMeshes.moon && cameraMode === "lunar") {
        planetMeshes.moon.scale.setScalar(MOON_SCALE);
        // Update offset if needed
        lunarFrameOffset.copy(isMobile ? LUNAR_OFFSET_MOBILE : LUNAR_OFFSET_DESKTOP);
    }
});


function mapDistanceAU(au) {
    // 1. Inner Solar System (Mercury to Mars)
    // Start at 30 units (Safety zone outside Sun), add 50 units per AU
    if (au < 2.5) {
        return 30 + (au * 50);
    }
    // 2. Outer Solar System (Jupiter+)
    // Continue from where Mars left off, but compress space slightly
    return 155 + (au - 2.5) * 30;
}

function createCircularOrbit(aAU) {
    const points = [];
    const segments = 256;
    const radius = mapDistanceAU(aAU);

    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(
            new THREE.Vector3(
                radius * Math.cos(theta),
                0,
                radius * Math.sin(theta)
            )
        );
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.2,
        transparent: true
    });

    return new THREE.LineLoop(geometry, material);
}


async function loadSolarForDate(dateObj) {
    const iso = dateObj.toISOString().slice(0, 10);
    const res = await fetch(
        `http://127.0.0.1:8000/api/solar/positions?date=${iso}`
    );

    if (!res.ok) {
        console.error("Solar API error:", res.status);
        return;
    }

    const data = await res.json();
    if (!data.positions) return;

    // Sun stays fixed
    if (planetMeshes.sun) planetMeshes.sun.position.set(0, 0, 0);
    for (const name in data.positions) {
        const meshKey = name.charAt(0).toUpperCase() + name.slice(1);
        const mesh = planetMeshes[meshKey];
        if (!mesh) continue;

        const { theta } = data.positions[name];

        // NEW: Sync the local angle with the backend data
        planetAngles[meshKey] = theta;

        const scaledDist = mapDistanceAU(PLANETS[meshKey].a);

        mesh.position.set(
            Math.cos(theta) * scaledDist,
            0,
            Math.sin(theta) * scaledDist
        );
    }

}

// Init Data
(async () => {
    try {
        const iso = realToday.toISOString().slice(0, 10);

        const moonData = await fetchMoonData(iso);
        updateMoonCards(moonData);

        await loadSolarForDate(realToday);
    } catch (e) {
        console.error("Init error:", e);
    } finally {
        const loaderUI = document.getElementById("loader");
        if (loaderUI) {
            loaderUI.style.opacity = "0";
            setTimeout(() => loaderUI.remove(), 800);
        }
    }
})();