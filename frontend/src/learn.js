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
    // Remove any existing scene/renderer before creating a new one
    cleanupScene();
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
                A <span style="color:#c47b00"><b>solar eclipse</b></span> occurs when the
                <span style="color:#c2b280"><b>Moon</b></span> travels precisely between the
                <span style="color:#2b7cff"><b>Earth</b></span> and the
                <span style="color:#ff9900"><b>Sun</b></span>, casting a shadow on portions of Earth's surface.
                Observers located inside the darkest central shadow — the <b>Umbra</b> — experience a total eclipse,
                where the Sun is completely blocked. Those in the lighter <b>Penumbra</b> region see only a partial eclipse.
            </p>

            <p>
                The geometry of solar eclipses is fascinating from a cosmic perspective. The Sun is approximately
                400 times larger than the Moon, yet it is also about 400 times farther away. This remarkable coincidence
                makes both bodies appear nearly the same size in Earth's sky, allowing the Moon to cover the Sun almost
                perfectly during a total eclipse.
            </p>

            <p>
                Solar eclipses progress through distinctive phases. The eclipse begins with a <b>first contact</b> when
                the Moon's edge touches the Sun's disc. Over the following hour or more, the Moon gradually covers more
                of the Sun in the <b>partial phase</b>. At <b>totality</b> (lasting only 1-7 minutes), the Moon completely
                blocks the bright photosphere, revealing the ethereal corona.
            </p>

            <p>
                During totality, dramatic phenomena occur: the sky darkens to twilight levels, bright stars become visible
                in daytime, and the temperature may drop by 10°C or more. The corona—normally invisible due to the bright
                photosphere—becomes a breathtaking sight, displaying delicate streamers and loops shaped by the Sun's magnetic field.
            </p>

            <p>
                The visual appearance depends critically on relative distances. When the Moon is slightly farther from Earth,
                it may not fully cover the Sun, producing an <b>annular</b> eclipse where a brilliant ring of sunlight remains
                visible around the Moon's silhouette. This "ring of fire" is equally spectacular but scientifically distinct from totality.
            </p>

            <p>
                Eclipse prediction relies on centuries of astronomical observations and orbital mechanics. Ancient astronomers
                discovered the 18-year <b>Saros cycle</b>—roughly every 18 years, 11 days, and 8 hours, eclipses repeat in a similar pattern.
                Modern calculations can predict eclipse paths and timing years in advance with remarkable precision.
            </p>

            <div class="lesson-extra">
                <p>
                    Solar eclipses are invaluable for scientific research. During totality, the corona's temperature structure, density,
                    and magnetic field can be studied directly. Measurements have revealed that the corona is paradoxically much hotter
                    than the Sun's surface—a phenomenon still not fully understood and actively studied.
                </p>

                <p>
                    Historically, eclipses have served as dramatic testing grounds for scientific theories. In 1919, Arthur Eddington's
                    eclipse expedition provided the first observational evidence for Einstein's general relativity by measuring starlight bending
                    near the Sun's edge. This single eclipse profoundly changed our understanding of gravity and spacetime.
                </p>

                <p>
                    Photography of solar eclipses is a rewarding pursuit. Time-lapse images reveal the fast-changing partial phases, while
                    detailed images of totality showcase the corona's intricate structure. Modern equipment allows amateur astronomers to capture
                    images rivaling professional observations from decades past.
                </p>

                <p>
                    Observing safety is absolutely essential when viewing any partial or annular phase. Never look directly at the Sun without
                    special protection; permanent eye damage can occur in seconds. Certified solar filters, eclipse glasses meeting ISO 12312-2 standards,
                    or projection methods are the only safe approaches for partial phases.
                </p>

                <p>
                    During totality itself—and only during totality—it is safe to view the eclipse without filters, as the bright photosphere is
                    completely hidden. However, observers must watch carefully: remove filters immediately before totality begins and replace them
                    before it ends. A common guideline is to practice the eclipse sequence before the event.
                </p>

                <p>
                    Planning an eclipse expedition offers adventure and scientific engagement. Path forecasts are released years in advance, allowing
                    observers to travel to optimal locations. Most total solar eclipses are only visible along a narrow path (typically 100–200 km wide)
                    across Earth's surface, making eclipse tourism both exciting and logistically challenging.
                </p>
                <h4>Why Eclipses Are Infrequent</h4>
                <p>
                    The Moon's orbit is tilted about <b>5°</b> relative to Earth's orbital plane (the ecliptic), so most New Moons pass
                    above or below the Sun in perspective. Eclipses occur only when the New Moon happens near the <b>line of nodes</b>,
                    the two points where the Moon's orbital plane intersects Earth's orbital plane. Between these node crossings occur roughly
                    every six months, limiting eclipse opportunities.
                </p>

                <h4>Types and Effects</h4>
                <ul>
                    <li><b>Total</b> — Sun completely covered; corona and corona prominences visible.</li>
                    <li><b>Annular</b> — Moon appears smaller than the Sun; a brilliant ring of sunlight remains.</li>
                    <li><b>Partial</b> — Only a portion of the Sun is covered; visible over a vast region.</li>
                    <li><b>Hybrid</b> — Rare; appears total along part of the path and annular along another.</li>
                </ul>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "lunar-eclipse") {
        createLunarEclipseScene(sceneDiv);
        textDiv.innerHTML = `
            <h2>Lunar Eclipse</h2>

            <p>
                A <span style="color:#2b7cff"><b>lunar eclipse</b></span> occurs when the
                <span style="color:#2b7cff"><b>Earth</b></span> stands between the
                <span style="color:#ff9900"><b>Sun</b></span> and the
                <span style="color:#c2b280"><b>Moon</b></span>, casting Earth's shadow across the lunar surface.
                Because Earth's atmosphere refracts and scatters sunlight, especially red wavelengths, the Moon
                can take on deep copper or red tones during totality—a phenomenon commonly called a <b>Blood Moon</b>.
                This reddening is due to atmospheric dispersion of starlight into the shadow.
            </p>

            <p>
                Lunar eclipses are instantly recognizable by their dramatic appearance and accessibility. Unlike
                solar eclipses, which are visible only along a narrow path on Earth, lunar eclipses can be observed
                from anywhere on Earth's night side where the Moon is above the horizon. This means that half of
                Earth's population can simultaneously witness a lunar eclipse.
            </p>

            <p>
                Lunar eclipses are completely safe to observe with the naked eye—no special filters or protective
                equipment is needed. This accessibility has made lunar eclipses culturally and historically significant
                across civilizations. Ancient peoples could time and predict lunar eclipses, contributing to early
                developments in astronomy and mathematics.
            </p>

            <p>
                The geometry of a lunar eclipse involves three distinct regions of Earth's shadow: the <b>umbra</b> (darkest,
                where all direct sunlight is blocked), the <b>penumbra</b> (twilight zone of partial shadow), and the surrounding
                space. As the Moon moves through these regions, observers witness a gradual dimming and color change.
            </p>

            <p>
                There are three principal types of lunar eclipse: <b>penumbral</b> (the Moon passes through Earth's penumbra,
                causing subtle shading that is often barely noticeable), <b>partial</b> (a portion of the Moon enters the umbra,
                with the shadow boundary clearly visible), and <b>total</b> (the entire Moon is immersed in the umbra, often
                displaying vivid red coloration).
            </p>

            <p>
                During a partial eclipse, the shadow boundary—called the <b>umbral shadow</b>—can be traced across the lunar
                surface. The illumination difference between the partially and fully eclipsed regions is dramatic and beautiful.
                Observers often note subtle relief features around the Moon's edge, visible only during the dim eclipse phase.
            </p>

            <div class="lesson-extra">
                <p>
                    At maximum eclipse—the point of greatest coverage—the eclipsed Moon's color depends strongly on atmospheric
                    conditions. If Earth's atmosphere contains little dust and few aerosols, the eclipse may be bright copper-red.
                    After major volcanic eruptions, which inject dust and ash into the atmosphere, the eclipsed Moon may appear
                    nearly black or gray.
                </p>

                <p>
                    Scientists actively use lunar eclipses to study Earth's atmosphere. The red transmission through the atmosphere
                    during totality can be analyzed to determine aerosol content, dust layer height, and even the effects of volcanic
                    eruptions. These observations provide complementary data to satellite atmospheric monitoring.
                </p>

                <p>
                    The Danjon scale is used to rate eclipse darkness on a scale of 0 (very dark) to 4 (very bright). This scale
                    provides a simple framework for observers to assess and report eclipse characteristics, contributing to a global
                    citizen-science database of atmospheric opacity over time.
                </p>

                <p>
                    The duration of a lunar eclipse is much longer than a solar eclipse. The entire event—from first penumbral
                    contact to final penumbral exit—may last 3-4 hours. The umbral phase (when the dramatic red coloration is visible)
                    typically lasts 1-2 hours, giving observers ample time to watch, photograph, and enjoy the event.
                </p>

                <p>
                    Photography of lunar eclipses is highly rewarding and requires minimal equipment. A simple camera on a tripod can
                    capture the full eclipse sequence. Time-lapse sequences create dramatic animations showing the Moon's gradual entry
                    and exit from Earth's shadow, emphasizing the geometry of the Earth–Moon–Sun system.
                </p>

                <p>
                    Lunar eclipses have played important roles in history and science. They provided early evidence for Earth's spherical
                    shape (Aristotle noted that Earth's shadow on the Moon is always circular). They also helped establish the scale of
                    the Moon's orbit and contributed to our understanding of celestial mechanics.
                </p>
                <h4>Observation Tips and Records</h4>
                <p>
                    Check local timings and Moon altitude using online eclipse calculators. Use binoculars or a small telescope to
                    resolve fine details and observe color variations across the lunar surface. Long-exposure photography will capture
                    subtle hues and the progression of Earth's shadow. Keep notes of the Danjon scale rating to contribute to atmospheric
                    studies. Consider observing multiple eclipses over years to track atmospheric changes.
                </p>
            </div>
        `;
    }

    if (lessonName === "earth-rotation") {
        createEarthRotationScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Earth Rotation</h2>

            <p>
                The <span style="color:#2b7cff"><b>Earth</b></span> rotates on its axis approximately once every
                24 hours, producing the familiar cycle of day and night as different longitudes face toward or away
                from the <span style="color:#ff9900"><b>Sun</b></span>. This rotation defines local solar time,
                governs daily environmental cycles, and is fundamental to all terrestrial life.
            </p>

            <p>
                Rotation velocity varies dramatically with latitude. At the equator, surface features move eastward
                at about 1,670 km/h (1,040 mph). At higher latitudes, this speed decreases; at the poles, rotation
                is a simple spin with essentially zero tangential velocity. This variation in rotational speed has
                important consequences for weather patterns and atmospheric circulation.
            </p>

            <p>
                A complete rotation can be measured in two ways. Measured against distant stars, a full rotation
                (a <b>sidereal day</b>) is about 23 hours, 56 minutes, and 4 seconds. The familiar 24-hour
                <b>solar day</b> is slightly longer because Earth also moves along its orbit. Thus, Earth must
                rotate a bit extra to bring the Sun back to the same meridian.
            </p>

            <p>
                Earth's rotation axis is tilted at approximately <b>23.5°</b> relative to its orbital plane. This
                axial tilt—called the <b>obliquity</b>—is the primary driver of Earth's seasons. Combined with
                Earth's orbital motion, this tilt causes the angle and duration of sunlight to vary throughout the year,
                creating distinct seasonal climates at most latitudes.
            </p>

            <p>
                The seasonal effects are pronounced. At the summer solstice at a given latitude, sunlight is most direct
                and lasts longest. At the winter solstice, sunlight is most oblique and lasts shortest. Between these extremes,
                the vernal and autumnal equinoxes occur, when day and night are nearly equal duration everywhere.
            </p>

            <p>
                Earth's axial tilt drives the distribution of solar energy across latitudes. Polar regions receive less
                energy because sunlight strikes at a shallow angle; tropical regions near the equator receive more direct,
                intense solar radiation. This differential heating drives atmospheric and oceanic circulation, creating wind
                patterns, ocean currents, and weather systems.
            </p>

            <div class="lesson-extra">
                <p>
                    The Coriolis effect results from Earth's rotation. Moving objects on Earth's surface appear to deflect due to
                    the rotation beneath them. This effect is essential for understanding weather systems, ocean currents, and even
                    projectile trajectories on Earth. The Coriolis effect is zero at the equator and maximum at the poles.
                </p>

                <p>
                    Over long timescales, Earth's rotation is not constant. <b>Precession</b>—a slow conical wobble of the rotation
                    axis—occurs over approximately 26,000 years. This wobble gradually changes which star is nearest the north celestial
                    pole, explaining why Polaris is the "North Star" now but will eventually be replaced by other stars.
                </p>

                <p>
                    Additionally, Earth's rotation rate is gradually slowing due to tidal friction caused by the Moon's gravity. The
                    Moon's tidal forces dissipate energy, causing Earth to lose angular momentum slowly. Over millions of years, days get
                    longer. Evidence from fossil patterns (growth rings in ancient corals) shows that Paleozoic days were shorter.
                </p>

                <p>
                    The interaction between Earth's rotation and the Moon creates tidal bulges. Water on the side facing the Moon is
                    pulled outward; water on the opposite side is also pulled outward due to reduced gravitational attraction. These
                    bulges are dragged around Earth by its rapid rotation, creating two high tides per day at most locations.
                </p>

                <p>
                    Short-term variations in Earth's rotation rate occur due to atmospheric circulation, ocean currents, and internal
                    mass redistribution. These variations are measured by atomic clocks and astronomical observations. The length of day
                    can vary by a few milliseconds, requiring periodic adjustments (leap seconds) to keep timekeeping synchronized with Earth's rotation.
                </p>

                <p>
                    Earth's magnetic field is generated by convection in the liquid outer core and is strongly influenced by rotation.
                    The rotation creates a dynamo effect that maintains this powerful field. The magnetosphere protects life from solar
                    radiation and cosmic rays, making rotation indirectly essential to habitability.
                </p>

                <h4>Practical Observations</h4>
                <p>
                    Observe star trails using long-exposure photography centered on the celestial pole to visualize rotation directly.
                    Track the Sun's changing rise and set positions across the year using a fixed landmark—the azimuth change dramatically
                    between solstices, demonstrating axial tilt. Use a simple sundial to observe apparent solar time and local solar noon.
                    Over weeks, note how sunset time diverges from noon by approximately 4 minutes per degree of longitude—this is Earth's
                    rotation coupled with orbital motion.
                </p>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "planet-orbits") {
        createPlanetOrbitsScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Planet Orbits</h2>

            <p>
                Planets orbit the <span style="color:#ff9900"><b>Sun</b></span> under the influence of gravity.
                Most planetary paths are elliptical, with the Sun at one focus, though many orbits are nearly
                circular. The exact orbital shape and speed depend on the balance between a planet's velocity
                and the Sun's gravitational pull. Each planet maintains a stable orbit that has persisted for billions of years.
            </p>

            <p>
                Mercury, the innermost planet, experiences the strongest gravitational pull and completes its orbit
                in just 88 Earth days. Venus follows with a 225-day year. Earth takes 365.25 days, traveling about
                30 km/s in its nearly circular path. Mars, as the outermost terrestrial planet, takes 687 days and moves
                more slowly. These rapid inner planets demonstrate how proximity to the Sun dictates orbital velocity and period.
            </p>

            <p>
                The giant planets exhibit the dramatic consequences of orbital mechanics. Jupiter takes 12 years to orbit,
                Saturn takes 29 years, Uranus takes 84 years, and Neptune requires a staggering 165 years. These vast periods
                reflect both enormous distances and the relatively weaker gravitational pull experienced in the outer solar system.
            </p>

            <p>
                Orbital speed varies within each orbit. When a planet is closer to the Sun (at <b>perihelion</b>), it moves fastest.
                When farther away (at <b>aphelion</b>), it moves slowest. This variation is not arbitrary—equal areas of the orbit are
                swept in equal times, a principle known as Kepler's second law. Planets "speed up" when approaching the Sun and "slow down" when leaving.
            </p>

            <p>
                <b>Kepler's three laws</b> describe all orbital motion with remarkable precision. The first law states that orbits are
                ellipses with the Sun at one focus. The second law (equal areas in equal times) describes variable orbital speed. The third law
                relates orbital period to orbital size: P² ∝ a³, where P is the period and a is the semi-major axis. This relationship holds
                for any object orbiting the Sun.
            </p>

            <p>
                Johannes Kepler derived these laws through careful analysis of Tycho Brahe's extraordinarily precise observations of Mars's
                position. Later, Isaac Newton explained Kepler's empirical laws through his universal law of gravitation and laws of motion.
                Gravity provides the centripetal force that keeps planets in orbit.
            </p>

            <div class="lesson-extra">
                <p>
                    Orbital resonances occur when planets' orbital periods form simple integer ratios. For example, Jupiter and Neptune have a
                    2:1 resonance (Neptune completes 1 orbit while Jupiter finishes 2). These resonances can stabilize orbits but can also cause
                    long-term dynamical instability or create gaps in asteroid belts. The Kirkwood gaps in the asteroid belt are regions depleted by resonance with Jupiter.
                </p>

                <p>
                    Perturbations—small gravitational pulls from other planets—gradually alter orbital elements. These perturbations are generally
                    small but accumulate over millions of years. The orbits of inner planets undergo slow precession; the orbit of Mercury precesses
                    slightly more than Newton's theory alone predicts, an effect explained perfectly by Einstein's general relativity.
                </p>

                <p>
                    Exoplanet discoveries have revealed orbital diversity beyond our solar system. Many exoplanets orbit much closer to their stars
                    than Mercury orbits the Sun; others occupy wide, distant orbits. Some planets move in retrograde orbits (opposite to the star's
                    rotation), and many orbit binary star systems. These discoveries have challenged initial assumptions and expanded our understanding of planetary formation.
                </p>

                <p>
                    Orbital stability over billions of years is a subtle mathematical problem. The solar system's planets have remained in relatively
                    stable orbits for 4.6 billion years, yet computer simulations show that small changes in initial conditions could lead to very different outcomes.
                    Asteroid and comet impacts may have thrown planetary orbits into temporary chaos millions of years ago, though the system self-stabilized.
                </p>

                <p>
                    Spacecraft navigation relies thoroughly on orbital mechanics. Sending probes to planets, establishing satellites in Earth orbit, and
                    landing on the Moon all require precise calculations based on Kepler's laws and gravitational theory. Gravity assists—where spacecraft
                    gain or lose speed by passing near a massive body—effectively transfer energy between orbits.
                </p>

                <p>
                    The future of planetary orbits is ultimately tied to the Sun's evolution. Over the next 5 billion years, the Sun will expand into
                    a red giant, likely engulfing Mercury, Venus, and possibly Earth. The surviving outer planets may be ejected from the solar system or
                    enter new, wider orbits as the Sun's mass decreases during its death throes.
                </p>

                <h4>Visualization and Exploration</h4>
                <p>
                    Use planetarium software or online simulations to visualize planetary orbits. Speed up time to watch inner planets "lap" outer
                    planets repeatedly. Modify initial velocity in simulations to see how orbits change. Observe the changing brightness of planets
                    as they move along their orbits relative to Earth. Calculate orbital periods using Kepler's third law given planetary distances.
                    Study exoplanet discoveries and compare their orbital characteristics to solar system planets.
                </p>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "planet-opposition") {
        createPlanetOppositionScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Planet Opposition</h2>

            <p>
                <span style="color:#ff6b6b"><b>Planet opposition</b></span> occurs when a planet is positioned directly opposite the
                <span style="color:#ff9900"><b>Sun</b></span> as viewed from <span style="color:#2b7cff"><b>Earth</b></span>. At this geometric alignment,
                the planet is on the far side of its orbit, 180 degrees away from the Sun's direction. This configuration creates unique observational
                opportunities: the planet is closest to Earth, brightest, and visible all night long.
            </p>

            <p>
                Opposition occurs only for planets with orbits larger than Earth's orbit—Mars, Jupiter, Saturn, Uranus, and Neptune. Since Mercury
                and Venus orbit closer to the Sun than Earth, they never reach opposition. Instead, these inner planets become invisible at certain times
                (conjunction) when they pass behind or between Earth and the Sun.
            </p>

            <p>
                The timing of opposition follows a predictable pattern. <b>Synodic period</b> is the time between successive oppositions of a planet—how
                long before the planet returns to the same geometric position relative to Earth. Mars has a synodic period of about 780 days (2.1 years);
                Saturn returns to opposition every 378 days. Jupiter, moving more slowly, opposes every 13 months. These intervals result from the different
                orbital velocities of Earth and each planet.
            </p>

            <p>
                At opposition, the entire night side of an exterior planet faces Earth, so the planet appears fully illuminated and at maximum brightness.
                The magnitude (brightness) of planets at opposition is dramatically greater than at other times. For example, Mars at opposition is roughly
                100 times brighter than at conjunction. Jupiter at opposition is a dazzling naked-eye object rivaling the brightest stars, while Saturn
                at opposition is faintly visible to the unaided eye.
            </p>

            <p>
                The distance between Earth and a planet varies with each opposition due to orbital eccentricity. When Mars reaches opposition at its closest
                (called "favorable opposition," every 15-17 years), it approaches within about 55 million kilometers. At unfavorable opposition, it is
                nearly twice as far. This variation has profound consequences for spacecraft missions attempting to reach Mars efficiently.
            </p>

            <p>
                Opposition is the ideal time for astronomical observation and scientific study. Telescopic resolution is maximized because the planet
                is closest. Planetary features (clouds, storms, rings, moons) become detailed. Professional astronomers and amateur observers alike schedule
                their observations around opposition dates. Simultaneous observations from Earth can measure the planet's distance using parallax and determine
                its actual size and composition.
            </p>

            <div class="lesson-extra">
                <p>
                    The phenomenon of opposition challenges early geocentric models of the solar system. Ptolemy's Earth-centered model required complex
                    epicycles (small orbits upon orbits) to explain why planets sometimes move backward across the sky and sometimes appear much brighter.
                    Copernicus's heliocentric model explained oppositions simply and naturally—planets appear brightest when closest to Earth.
                </p>

                <p>
                    During opposition, planets exhibit <b>retrograde motion</b>—they temporarily move backward relative to the background stars. This occurs
                    because Earth, orbiting closer to the Sun, moves faster and overtakes the outer planet. From Earth's perspective, the slower planet appears
                    to move backward. Retrograde motion ends when Earth pulls ahead, and the planet resumes normal motion. Opposition is the center of this
                    retrograde period.
                </p>

                <p>
                    Radio astronomy at opposition provides unique advantages. The planet is overhead (high in the sky from many latitudes) with minimal atmospheric
                    distortion. Radar observations at opposition have mapped Venus's surface in exquisite detail, revealing volcanic features beneath the opaque
                    clouds. Radar ranging also provides the most precise distance measurements, which improve Kepler's laws and detect subtle perturbations.
                </p>

                <p>
                    Space missions are strategically timed around opposition. Successful Mars rovers and landers were often launched in favorable opposition years.
                    Opposition windows offer the shortest travel times—during Mars opposition, a spacecraft requires months to reach the planet; during conjunction,
                    years would be necessary. This is why Mars missions follow a ~26-month cycle tied to successive favorable oppositions.
                </p>

                <p>
                    The changing magnitudes and apparent sizes of planets throughout their synodic cycles provided some of the earliest evidence for heliocentric cosmology.
                    Galileo's telescopic observations in 1610 revealed that Venus has phases (like the Moon) and that Jupiter has moons orbiting it. These discoveries
                    shattered the premise of Earth-centered models and vindicated Copernicus's heliocentric vision decades after his death.
                </p>

                <p>
                    Modern exoplanet detection often uses opposition-like geometries. The transit method detects exoplanets when they pass in front of their host stars
                    (a configuration similar to inferior conjunction for inner planets). When exoplanets reach opposition-like positions relative to Earth (rarely observable directly),
                    their reflected light can potentially be detected, though it is extremely faint.
                </p>

                <h4>Practical Observational Guide</h4>
                <p>
                    Opposition dates are published annually by astronomical societies. Mark opposition dates for observable planets on your calendar. Plan evening
                    observations beginning a few hours after sunset and continuing through midnight for best visibility. At opposition, planets are visible all night
                    and rise near sunset. Use a telescope to resolve surface details like the Great Red Spot on Jupiter or Saturn's ring system. Track the planet's
                    brightness over weeks by comparing its magnitude to known reference stars. Photograph the planet's change in apparent size as it transitions from
                    pre-opposition approach through opposition and into recession. Record the planet's retrograde motion by plotting its position against background stars
                    night after night—the backward loop is most pronounced at opposition.
                </p>

                <h4>Why Opposition Matters</h4>
                <ul>
                    <li>Maximum <b>brightness</b> and <b>proximity</b> to Earth make observation and photography optimal.</li>
                    <li>Enables <b>parallax measurements</b> to determine planetary distances and refine the astronomical unit (AU).</li>
                    <li>Provides <b>spacecraft launch windows</b> for efficient interplanetary missions.</li>
                    <li>Historical <b>evidence</b> for heliocentrism and modern orbital mechanics.</li>
                    <li>Gateway to <b>retrograde motion</b> concepts and relative orbital dynamics.</li>
                </ul>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "gravity-visualisation") {
        createGravityScene(sceneDiv);

        textDiv.innerHTML = `
            <h2>Gravity: Space-Time Fabric</h2>

            <p>
                Gravity can be visualised as distortions in the <b>space-time fabric</b>. Massive objects deform the grid
                of space-time, causing nearby bodies to follow curved paths—what we interpret as gravitational attraction.
            </p>

            <p>
                In this lesson you will see a simplified fabric: a flexible grid that sinks under a heavy mass. Nearby test
                particles will move along the curved surface, illustrating orbits and deflection in an intuitive way.
            </p>

            <p>
                The depth of the deformation depends on the mass and distance. Close to the mass the fabric is steeply curved;
                further away the curvature becomes shallower. This gradient directs the acceleration experienced by nearby bodies.
            </p>

            <p>
                While general relativity describes gravity as geometry of spacetime, this visualisation provides an accessible
                analogue—useful for building physical intuition about orbital motion, escape velocity, and tidal effects.
            </p>

            <p>
                Notice how moving the mass (or changing its size) alters nearby trajectories. Even a small change in mass can
                significantly change orbital periods and stability for close-in objects.
            </p>

            <p>
                Use this interactive view to experiment: watch how particles spiral inward or settle into stable paths depending
                on their initial velocity and the local curvature of the fabric.
            </p>

            <div class="lesson-extra">
                <p>
                    The mathematical description behind this picture uses the Einstein field equations; mass-energy tells spacetime
                    how to curve, and spacetime tells mass how to move. Our grid is a low-dimensional analogy that captures the most
                    important geometric behavior for visual learning.
                </p>

                <p>
                    Orbits arise where a body's tangential velocity balances the inward curvature of space. In Newtonian terms this
                    is centripetal force provided by gravity; in relativistic terms it is motion along a geodesic in curved spacetime.
                </p>

                <p>
                    Tidal forces appear because different parts of an extended body sit at slightly different depths in the fabric,
                    causing differential acceleration. These forces can stretch and squeeze objects and are crucial for understanding
                    phenomena like Roche limits and tidal heating.
                </p>

                <p>
                    This model also helps explain gravitational lensing: light follows geodesics too, so when spacetime is curved by
                    a large mass, the apparent position of background objects shifts and their images can be distorted into arcs.
                </p>

                <p>
                    For deeper study, compare this visual approach with quantitative simulations using Newtonian gravity or full
                    relativistic ray-tracing. Both approaches illuminate different aspects of how mass and geometry interact.
                </p>

                <p>
                    Try adjusting mass, initial speed, or release position in the simulation to observe capture, slingshot, or escape
                    behaviors. Notice how the fabric analogy remains powerful but limited—real spacetime is four-dimensional and not a literal sheet.
                </p>

                <h4>Practical Experiments</h4>
                <ul>
                    <li>Place a small mass near the central sink and observe orbital precession.</li>
                    <li>Increase mass to see capture vs escape thresholds.</li>
                    <li>Release multiple test particles to watch interactions and collisions mediated by curvature.</li>
                </ul>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "moon-missions") {
        createMoonMissionsScene(sceneDiv);
        textDiv.innerHTML = `
            <h2>Moon Missions Across the Ages</h2>
            <p>
                The Moon has been a target of human curiosity for centuries. Starting with
                unmanned lunar probes in the mid-20th century, a parade of spacecraft
                from various nations have visited, orbited, landed, and even lifted off
                from Earth's natural satellite. This lesson explores those missions from
                the pioneering early days through the golden era of crewed Apollo flights
                and into our near-future plans.
            </p>
            <p>
                Soviet Luna 9 achieved the first soft landing on the Moon in February
                1966, sending back the first images from the surface. Shortly after, Luna
                10 became the first artificial satellite of the Moon, opening up a new
                way to map and study the lunar environment from orbit.
            </p>
            <p>
                The United States' Apollo program captured the world when Apollo 11
                successfully carried Neil Armstrong and Buzz Aldrin to the lunar surface
                in July 1969. The famous words "That's one small step for man, one giant
                leap for mankind" marked the beginning of six crewed landings that returned
                samples and forever changed our view of the cosmos.
            </p>
            <p>
                Decades later, a new generation of robotic explorers arrived. India's
                Chandrayaan-1 orbited the Moon in 2008, discovering water molecules in
                lunar soil. Its successor Chandrayaan-2 attempted a soft landing in
                2019, with a rover designed to study the surface. Although the lander
                experienced a hard touchdown, the orbiter continues to provide valuable
                scientific data.
            </p>
            <p>
                Exactly one year later, in 2020, Chandrayaan-3 successfully soft-landed a
                rover near the lunar south pole, becoming the first mission to operate in
                that challenging region. These Indian missions demonstrate the expanding
                international interest in lunar science and exploration.
            </p>
            <p>
                China's Chang'e program has also made remarkable strides. Chang'e 3
                accomplished a soft landing and deployed the Yutu rover in 2013. Later
                missions, including Chang'e 4, achieved the first landing on the lunar
                far side, and Chang'e 5 returned the first lunar samples to Earth since
                the 1970s. The Chang'e series continues with ambitious plans for crewed
                flights and outpost construction.
            </p>
            <p>
                Japan's Kaguya (SELENE) orbited the Moon in 2007, carrying an array of
                instruments to map its gravitational field, surface composition, and
                topology. These detailed surveys have been instrumental in planning
                future missions and understanding the Moon's internal structure.
            </p>
            <p>
                In the coming years, humanity is preparing to return astronauts to the
                Moon. NASA's Artemis program aims to land the first woman and next man
                near the lunar south pole, using the Orion spacecraft launched atop
                Space Launch System rockets. Artemis I was an uncrewed test flight that
                circled the Moon, and Artemis II will carry a crew on a lunar flyby.
                Artemis III is targeted to set foot on the surface around 2025.
            </p>
            <p>
                India is also planning Chandrayaan-4, which will further investigate the
                south polar region with advanced landers and rovers, possibly in
                collaboration with international partners. Commercial companies are
                proposing a variety of missions, from small landers to mining
                prospectors, fueling an exciting new chapter in lunar exploration.
            </p>
            <p>
                As these projects unfold, the basic physics of orbital motion remain the
                same principles we explore in earlier lessons. Watching miniature probes
                orbit the lunar sphere in this simulated environment helps illustrate how
                trajectories are governed by gravity, and why mission designers choose
                particular paths and altitudes for science and landings.
            </p>
            <div class="lesson-extra">
                <h4>Key Highlights</h4>
                <ul>
                    <li>1966 – Luna 9 first soft lunar landing</li>
                    <li>1969 – Apollo 11 crewed lunar surface mission</li>
                    <li>2008 – Chandrayaan‑1 discovers lunar water</li>
                    <li>2019 – Chang'e 4 lands on far side of the Moon</li>
                    <li>2024+ – Artemis returns humans; Chandrayaan‑4 expands polar science</li>
                </ul>
            </div>
            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    if (lessonName === "black-hole-time-dilation") {
        createBlackHoleScene(sceneDiv);
        textDiv.innerHTML = `
            <h2>Black Holes & Time Dilation</h2>
            <p>
                A <span style="color:#ff6600"><b>black hole</b></span> is a region of spacetime where gravity is so extreme
                that nothing—not even light—can escape. At the heart of a black hole lies the <b>singularity</b>, a point of
                infinite density. Surrounding it is the <b>event horizon</b>, the point of no return from which not even light
                can break free.
            </p>

            <p>
                The most remarkable consequence of black holes is <b>time dilation</b>. Near a black hole's event horizon,
                the warping of spacetime becomes so severe that time itself appears to slow down. An observer far from the
                black hole would see a falling object slow down asymptotically as it approaches the event horizon, taking
                infinite time to reach it. However, the falling observer experiences proper time normally and crosses the
                event horizon in finite time—though they cannot escape.
            </p>

            <p>
                This profound effect arises from Einstein's general relativity: massive objects curve spacetime, and the
                curvature is proportional to the mass and inversely proportional to distance. Near a black hole's event horizon,
                this curvature becomes so extreme that time behaves differently at different distances.
            </p>

            <p>
                Black holes are characterized by three parameters: mass, charge, and angular momentum (spin). The simplest
                black hole—the <b>Schwarzschild black hole</b>—is uncharged and non-rotating. The radius of its event horizon,
                called the <b>Schwarzschild radius</b>, depends only on mass: r_s = 2GM/c², where G is Newton's constant, M is mass,
                and c is the speed of light.
            </p>

            <p>
                Around most black holes exists an <b>accretion disk</b>—a swirling ring of gas, dust, and stellar material spiraling
                inward. As material orbits faster closer to the event horizon, friction heats it to extreme temperatures, causing
                it to emit brilliant X-rays and radiation. These accretion disk emissions are often how astronomers detect black holes.
            </p>

            <div class="lesson-extra">
                <p>
                    The <b>Hawking radiation</b> phenomenon, discovered by Stephen Hawking in 1974, shows that black holes are not
                    entirely black. Quantum effects near the event horizon can create particle-antiparticle pairs, causing black holes
                    to slowly evaporate. For stellar-mass black holes, this process is negligible, but for small primordial black holes,
                    Hawking radiation could cause rapid evaporation.
                </p>

                <p>
                    The <b>ergosphere</b> of a rotating (Kerr) black hole is a region outside the event horizon where spacetime is so
                    severely twisted that objects cannot remain stationary—they are forcibly dragged around the black hole. The Penrose
                    process theoretically allows extraction of rotational energy from this region.
                </p>

                <p>
                    Black holes violate our everyday intuition about causality and information. The <b>information paradox</b> asks whether
                    information falling into a black hole is lost forever or somehow preserved. This unresolved question hints at deep
                    connections between quantum mechanics and gravity.
                </p>

                <p>
                    The merger of two black holes releases gravitational waves—ripples in spacetime itself. The first direct detection of
                    gravitational waves in 2015 came from merging black holes, confirming Einstein's century-old prediction and opening a
                    new window for observing the universe.
                </p>

                <p>
                    Supermassive black holes at galaxy centers, millions to billions of times more massive than the Sun, play a crucial role
                    in galaxy formation and evolution. The supermassive black hole at the center of our Milky Way, Sagittarius A*, is about
                    4 million solar masses.
                </p>

                <p>
                    Recent observations by the Event Horizon Telescope captured the first images of black hole shadows—the dark silhouette of
                    the event horizon against the bright accretion disk. These observations provide direct visual confirmation of general relativity
                    and black hole physics.
                </p>

                <h4>Time Dilation Near Black Holes</h4>
                <p>
                    The gravitational time dilation factor near a black hole is given by: dt/dτ = √(1 - r_s/r), where r_s is the Schwarzschild
                    radius and r is distance from the center. As r approaches r_s, this factor approaches zero, meaning time essentially stops for
                    a distant observer. However, locally (in the reference frame of the falling object), time proceeds normally until the event horizon is crossed.
                </p>

                <h4>Key Concepts</h4>
                <ul>
                    <li><b>Event Horizon</b> — The boundary from which escape is impossible</li>
                    <li><b>Singularity</b> — The infinitely dense center (classical understanding breaks down)</li>
                    <li><b>Accretion Disk</b> — Infalling matter heated to extreme temperatures</li>
                    <li><b>Time Dilation</b> — Time slows relative to distant observers</li>
                    <li><b>Hawking Radiation</b> — Quantum evaporation of black holes</li>
                    <li><b>Gravitational Waves</b> — Spacetime ripples from orbiting/merging black holes</li>
                </ul>
            </div>

            <button class="lesson-toggle-btn">Show More</button>
        `;
    }

    const toggleBtn = textDiv.querySelector(".lesson-toggle-btn");
    const extra = textDiv.querySelector(".lesson-extra");

    if (toggleBtn && extra) {
        toggleBtn.addEventListener("click", () => {
            extra.classList.toggle("expanded");

            toggleBtn.textContent =
                extra.classList.contains("expanded")
                    ? "Show Less"
                    : "Show More";
        });
    }
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

    // Improve overall brightness and color rendering
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMappingExposure = 1.0;

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

    // Add a gentle hemisphere + ambient light so materials are visible
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    scene.add(hemi);

    const baseAmb = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(baseAmb);

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
    const sunLight = new THREE.PointLight(0xffffff, 20, 100);
    sunLight.position.copy(sun.position);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);

    // Ambient
    scene.add(new THREE.AmbientLight(0x404040, 0.9));

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
   SCENE 3: EARTH ROTATION
   ======================================================== */
function createEarthRotationScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // SUN (light source)
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    sun.position.set(-16, 0, 0);
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 2.2, 300);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0x404040, 0.4));

    // Earth group to allow axis tilt
    const earthGroup = new THREE.Group();
    earthGroup.rotation.z = THREE.MathUtils.degToRad(23.5);
    scene.add(earthGroup);

    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        new THREE.MeshStandardMaterial({ color: 0x2266ff, roughness: 0.7 })
    );
    earth.castShadow = true;
    earth.receiveShadow = true;
    earthGroup.add(earth);

    // Simple Moon orbiting
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0x999999 })
    );
    moon.position.set(5, 0, 0);
    scene.add(moon);

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.001;

        // Earth spins on its tilted axis
        earth.rotation.y = t * 0.8;

        // Moon orbits Earth
        moon.position.x = earth.position.x + 5 * Math.cos(t * 0.9);
        moon.position.z = earth.position.z + 5 * Math.sin(t * 0.9);

        renderer.render(scene, camera);
    }

    animate();
}

/* ========================================================
   SCENE 4: PLANET ORBITS (Sun-centered)
   ======================================================== */
function createPlanetOrbitsScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // Sun
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(3.2, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0xffcc33 })
    );
    scene.add(sun);

    const sunLight = new THREE.PointLight(0xffffff, 3.0, 1000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0x222222, 0.6));

    // Simple planet configs: name, radius, size, color, speed multiplier
    const planets = [
        { r: 6, size: 0.5, color: 0xaaaaaa, speed: 1.8 }, // Mercury-like
        { r: 9, size: 0.8, color: 0xffaa66, speed: 1.2 }, // Venus-like
        { r: 12, size: 1.0, color: 0x2266ff, speed: 1.0 }, // Earth-like
        { r: 18, size: 0.9, color: 0xffcc99, speed: 0.5 }  // Mars/Jupiter-ish
    ];

    const meshes = planets.map(p => {
        const m = new THREE.Mesh(
            new THREE.SphereGeometry(p.size, 32, 32),
            new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.7 })
        );
        scene.add(m);
        return m;
    });

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.0006;

        meshes.forEach((m, i) => {
            const p = planets[i];
            m.position.x = p.r * Math.cos(t * p.speed);
            m.position.z = p.r * Math.sin(t * p.speed);
        });

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
            color: 0x2b44aa,
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

/* ========================================================
   SCENE 5: PLANET OPPOSITION (Sun -> Earth -> Planet)
   ======================================================== */
function createPlanetOppositionScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // 1. SUN (Left side)
    const sun = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshBasicMaterial({ color: 0xffcc66 })
    );
    sun.position.set(-12, 0, 0);
    scene.add(sun);

    // Light Source
    const sunLight = new THREE.PointLight(0xffffff, 2.8, 300);
    sunLight.position.copy(sun.position);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    scene.add(sunLight);

    scene.add(new THREE.AmbientLight(0x444444, 0.3));

    // 2. EARTH (Center)
    const earth = new THREE.Mesh(
        new THREE.SphereGeometry(1.8, 64, 64),
        new THREE.MeshStandardMaterial({
            color: 0x2b7cff,
            roughness: 0.7
        })
    );
    earth.receiveShadow = true;
    earth.castShadow = true;
    scene.add(earth);

    // 3. OPPONENT PLANET (Right side - Opposition position)
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 64, 64),
        new THREE.MeshStandardMaterial({
            color: 0xff6b6b,
            roughness: 0.7
        })
    );
    planet.receiveShadow = true;
    planet.castShadow = true;
    planet.position.set(12, 0, 0);
    scene.add(planet);

    // 4. OPPOSITION LINE (Visual indicator)
    const lineGeom = new THREE.BufferGeometry();
    const linePoints = [
        new THREE.Vector3(-16, 0, 0),
        new THREE.Vector3(16, 0, 0)
    ];
    lineGeom.setFromPoints(linePoints);

    const lineMat = new THREE.LineBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.4,
        linewidth: 1
    });

    const alignmentLine = new THREE.Line(lineGeom, lineMat);
    scene.add(alignmentLine);

    // 5. ORBITAL PATHS (subtle dashed lines)
    const earthOrbitGeom = new THREE.BufferGeometry();
    const earthOrbitPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        earthOrbitPoints.push(new THREE.Vector3(7 * Math.cos(angle), 0, 7 * Math.sin(angle)));
    }
    earthOrbitGeom.setFromPoints(earthOrbitPoints);
    const earthOrbitLine = new THREE.Line(earthOrbitGeom, new THREE.LineBasicMaterial({
        color: 0x2b7cff,
        transparent: true,
        opacity: 0.2,
        linewidth: 0.5
    }));
    scene.add(earthOrbitLine);

    const planetOrbitGeom = new THREE.BufferGeometry();
    const planetOrbitPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        planetOrbitPoints.push(new THREE.Vector3(14 * Math.cos(angle), 0, 14 * Math.sin(angle)));
    }
    planetOrbitGeom.setFromPoints(planetOrbitPoints);
    const planetOrbitLine = new THREE.Line(planetOrbitGeom, new THREE.LineBasicMaterial({
        color: 0xff6b6b,
        transparent: true,
        opacity: 0.2,
        linewidth: 0.5
    }));
    scene.add(planetOrbitLine);

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.0004;

        // Earth orbits faster (inner orbit)
        earth.position.x = 7 * Math.cos(t * 1.8);
        earth.position.z = 7 * Math.sin(t * 1.8);

        // Planet orbits slower (outer orbit)
        planet.position.x = 14 * Math.cos(t);
        planet.position.z = 14 * Math.sin(t);

        // Slightly spin both celestial bodies for visual interest
        earth.rotation.y += 0.003;
        planet.rotation.y += 0.002;

        renderer.render(scene, camera);
    }

    animate();
}

/* ========================================================
   SCENE 6: GRAVITY VISUALISATION (Space-Time Fabric Analogy)
   ======================================================== */
function createGravityScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // Tweak camera for a better top-down view of the fabric
    camera.position.set(0, 10, 16);
    camera.lookAt(0, 0, 0);

    // Ambient environment
    scene.add(new THREE.AmbientLight(0x888888, 0.9));

    // Directional rim light for shape
    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(10, 30, 10);
    scene.add(rim);

    // Flexible fabric: plane geometry we will deform
    const size = 30;
    const segments = 80;
    const planeGeo = new THREE.PlaneGeometry(size, size, segments, segments);
    planeGeo.rotateX(-Math.PI / 2);

    const planeMat = new THREE.MeshStandardMaterial({
        color: 0x0b1730,
        metalness: 0.05,
        roughness: 0.9,
        side: THREE.DoubleSide,
        flatShading: false,
        wireframe: true,
        wireframeLinewidth: 1
    });

    const fabric = new THREE.Mesh(planeGeo, planeMat);
    fabric.position.y = 0;
    fabric.receiveShadow = false;
    scene.add(fabric);

    // Central mass (sphere) that will warp the fabric
    const mass = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0x332200, roughness: 0.6 })
    );
    mass.position.set(0, 1.6, 0);
    scene.add(mass);

    // Visual ring under mass to accentuate deformation
    const ringGeom = new THREE.RingGeometry(1.6, 6, 64);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06 });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.y = 0.01;
    scene.add(ring);

    // Small test particle to show motion on fabric
    const particle = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x66ccff, roughness: 0.6 })
    );
    particle.position.set(6, 0.2, 0);
    scene.add(particle);

    const posAttr = planeGeo.attributes.position;
    const vertexCount = posAttr.count;

    // Simple parameters
    const massStrength = 6.5; // controls depth of well
    let tStart = Date.now();

    // Ensure the thumbnail mass animates (if CSS exists)
    const thumbMass = document.querySelector('.gravity-preview .gravity-mass');
    if (thumbMass) thumbMass.classList.add('animate');

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = (Date.now() - tStart) * 0.001;

        // Slightly bob the mass for visual interest
        mass.position.y = 1.4 + Math.sin(t * 0.9) * 0.12;

        // Deform fabric vertices based on distance to mass (projected onto XZ plane)
        for (let i = 0; i < vertexCount; i++) {
            const ix = i * 3;
            const vx = posAttr.array[ix];
            const vy = posAttr.array[ix + 1];
            const vz = posAttr.array[ix + 2];

            // world coordinates of vertex (plane is centered at origin)
            const dx = vx - mass.position.x;
            const dz = vz - mass.position.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            // Inverse relation: deeper near center, softer outside
            const depth = -massStrength / (dist + 1.0);

            // Add a small time-varying ripple
            const ripple = Math.sin(dist * 4.0 - t * 2.5) * 0.02 / (dist + 0.8);

            posAttr.array[ix + 1] = depth + ripple;
        }

        posAttr.needsUpdate = true;
        planeGeo.computeVertexNormals();

        // Move particle slowly around the well to demonstrate curved trajectories
        const orbitR = 6.0;
        particle.position.x = orbitR * Math.cos(t * 0.35);
        particle.position.z = orbitR * Math.sin(t * 0.35);
        particle.position.y = 0.25 + (-massStrength / (Math.hypot(particle.position.x - mass.position.x, particle.position.z - mass.position.z) + 1.0)) * 0.6;

        // Slight rotations for ring and fabric for subtle dynamics
        ring.rotation.y += 0.0008;

        renderer.render(scene, camera);
    }

    animate();
}

/* ========================================================
   SCENE 7: MOON MISSIONS (Orbital Probes)
   ======================================================== */
function createMoonMissionsScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // position camera so the orbits are visible
    camera.position.set(0, 6, 20);
    camera.lookAt(0, 0, 0);

    // central moon
    const moon = new THREE.Mesh(
        new THREE.SphereGeometry(3, 64, 64),
        new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8 })
    );
    scene.add(moon);

    // lights
    const point = new THREE.PointLight(0xffffff, 1.2);
    point.position.set(10, 10, 10);
    scene.add(point);
    scene.add(new THREE.AmbientLight(0x333333, 0.5));

    // mission orbits as small spheres
    const missions = [
        { r: 6, speed: 0.018, color: 0xff6666 },    // early Luna 9/10
        { r: 8, speed: 0.015, color: 0x66ccff },    // Apollo 11-style
        { r: 10, speed: 0.012, color: 0x66ff66 },   // Chandrayaan-1
        { r: 12, speed: 0.009, color: 0xffff66 }    // Chang'e
    ];

    const missionMeshes = missions.map(m => {
        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.25, 8, 8),
            new THREE.MeshStandardMaterial({ color: m.color, emissive: 0x111111 })
        );
        scene.add(mesh);
        return mesh;
    });

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;

        missions.forEach((m, i) => {
            const angle = t * m.speed * Math.PI * 2;
            missionMeshes[i].position.set(
                Math.cos(angle) * m.r,
                0,
                Math.sin(angle) * m.r
            );
        });

        renderer.render(scene, camera);
    }

    animate();
}

/* ========================================================
   SCENE 8: BLACK HOLE & TIME DILATION
   ======================================================== */
function createBlackHoleScene(container) {
    const { scene, camera, renderer } = createBaseScene(container);

    // Adjust camera for better black hole view
    camera.position.set(0, 8, 25);
    camera.lookAt(0, 0, 0);

    // Deep space background
    scene.background = new THREE.Color(0x000000);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Add distant stars
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
        starPositions[i] = (Math.random() - 0.5) * 200;      // x
        starPositions[i + 1] = (Math.random() - 0.5) * 200;  // y
        starPositions[i + 2] = (Math.random() - 0.5) * 200;  // z
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.4,
        sizeAttenuation: true,
        opacity: 0.8,
        transparent: true
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // BLACK HOLE (Central Sphere - Pure Black)
    const blackHole = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        new THREE.MeshBasicMaterial({
            color: 0x000000,
            emissive: 0x220000
        })
    );
    scene.add(blackHole);

    // EVENT HORIZON GLOW RING
    const horizonGeometry = new THREE.TorusGeometry(2.1, 0.15, 32, 32);
    const horizonMaterial = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.8,
        emissive: 0xff6600
    });
    const eventHorizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
    eventHorizon.rotation.x = Math.PI * 0.3;
    scene.add(eventHorizon);

    // ACCRETION DISK (Rotating Ring of Matter)
    const diskGeometry = new THREE.TorusGeometry(5, 1.2, 32, 256);
    const diskMaterial = new THREE.MeshStandardMaterial({
        color: 0xff8800,
        emissive: 0xff6600,
        metalness: 0.3,
        roughness: 0.4
    });
    const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
    accretionDisk.rotation.x = Math.PI * 0.25; // Slight tilt
    scene.add(accretionDisk);

    // INNER ACCRETION DISK (Brighter, hotter)
    const innerDiskGeometry = new THREE.TorusGeometry(3.5, 0.7, 32, 256);
    const innerDiskMaterial = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff8800,
        metalness: 0.4,
        roughness: 0.3
    });
    const innerAccretionDisk = new THREE.Mesh(innerDiskGeometry, innerDiskMaterial);
    innerAccretionDisk.rotation.x = Math.PI * 0.25;
    scene.add(innerAccretionDisk);

    // GRAVITATIONAL LENSING EFFECT (Semi-transparent sphere)
    const lensGeometry = new THREE.SphereGeometry(8, 32, 32);
    const lensMaterial = new THREE.MeshBasicMaterial({
        color: 0x6600ff,
        transparent: true,
        opacity: 0.08,
        wireframe: true
    });
    const lensingField = new THREE.Mesh(lensGeometry, lensMaterial);
    scene.add(lensingField);

    // TEST PARTICLES (Matter falling toward black hole)
    const particles = [];
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 9 + Math.random() * 4;
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 1, 0.5),
                emissive: new THREE.Color().setHSL(0.08 + Math.random() * 0.05, 1, 0.4),
                roughness: 0.6
            })
        );
        particle.position.set(
            Math.cos(angle) * radius,
            (Math.random() - 0.5) * 2,
            Math.sin(angle) * radius
        );
        scene.add(particle);
        particles.push({
            mesh: particle,
            angle: angle,
            startRadius: radius,
            speed: 0.005 + Math.random() * 0.008
        });
    }

    // TIME DILATION INDICATOR (Gravitational Field Lines)
    const fieldLines = new THREE.Group();
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const lineGeometry = new THREE.BufferGeometry();
        const linePoints = [];

        for (let r = 2.5; r <= 12; r += 0.5) {
            const x = Math.cos(angle) * r;
            const z = Math.sin(angle) * r;
            linePoints.push(new THREE.Vector3(x, 0, z));
        }

        lineGeometry.setFromPoints(linePoints);
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
        });
        const line = new THREE.Line(lineGeometry, lineMaterial);
        fieldLines.add(line);
    }
    scene.add(fieldLines);

    // TIME DILATION TEXT VISUALIZATION (Orbiting labels)
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TIME', 128, 100);
    ctx.fillText('SLOWS', 128, 156);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteGeo = new THREE.PlaneGeometry(3, 3);
    const spriteMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        emissive: 0x00ffff
    });
    const timeLabel = new THREE.Mesh(spriteGeo, spriteMat);
    timeLabel.position.set(0, 8, 0);
    scene.add(timeLabel);

    function animate() {
        currentAnimationFrame = requestAnimationFrame(animate);

        const t = Date.now() * 0.0005;

        // Spin black hole glow rings
        eventHorizon.rotation.z += 0.008;
        accretionDisk.rotation.z += 0.004;
        innerAccretionDisk.rotation.z += 0.006;

        // Animate lensing field
        lensingField.rotation.x += 0.0005;
        lensingField.rotation.y += 0.0008;

        // Animate gravitational field lines with pulsing effect
        fieldLines.children.forEach((line, i) => {
            line.material.opacity = 0.2 + 0.15 * Math.sin(t * 2 + i);
        });

        // Particles spiral inward (time dilation effect)
        particles.forEach(p => {
            // Increase angle (orbital motion)
            p.angle += p.speed;

            // Gradually decrease radius (inward spiral)
            const radiusDecay = Math.max(2.3, p.startRadius - t * 1.5);

            // Position the particle
            p.mesh.position.x = Math.cos(p.angle) * radiusDecay;
            p.mesh.position.z = Math.sin(p.angle) * radiusDecay;

            // Vertical oscillation
            p.mesh.position.y = 2 * Math.sin(p.angle * 2 + t * 2);

            // Particles glow brighter as they approach
            const proximity = 1 - (radiusDecay - 2.3) / (p.startRadius - 2.3);
            p.mesh.material.emissiveIntensity = 0.5 + proximity * 0.8;

            // Subtle rotation
            p.mesh.rotation.x += 0.02;
            p.mesh.rotation.y += 0.03;
        });

        // Time label orbits the black hole
        timeLabel.position.x = 10 * Math.cos(t * 0.6);
        timeLabel.position.z = 10 * Math.sin(t * 0.6);
        timeLabel.rotation.z = t * 0.3;

        renderer.render(scene, camera);
    }

    animate();
}

// ...existing code...