export async function fetchMoonData(dateStr, lat = null, lon = null) {
    let url = `http://127.0.0.1:8000/moon?d=${dateStr}`;

    if (lat !== null && lon !== null) {
        url += `&lat=${lat}&lon=${lon}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Backend error");

    return await res.json();
}
