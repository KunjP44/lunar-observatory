const IS_LOCAL =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

export async function fetchMoonData(date) {

    // Local dev → Python backend
    if (IS_LOCAL) {
        const res = await fetch(
            `http://127.0.0.1:8000/api/moon?date=${date}`
        );
        if (!res.ok) throw new Error("Moon API failed");
        return await res.json();
    }

    // GitHub Pages → static JSON (ABSOLUTE PATH)
    const res = await fetch(
        `/lunar-observatory/frontend/public/data/moon/${date}.json`
    );

    if (!res.ok) {
        throw new Error("Moon JSON not found: " + date);
    }

    return await res.json();
}
