const apkBtn = document.getElementById("download-apk");
const exeBtn = document.getElementById("download-exe");
const pwaBtn = document.getElementById("launch-pwa");

const APK_PATH = "https://github.com/KunjP44/lunar-observatory/releases/latest/download/lunar-observatory.apk";
const PWA_URL = "https://kunjp44.github.io/lunar-observatory-app/";

async function fileExists(url) {
    try {
        const res = await fetch(url, { method: "HEAD" });
        return res.ok;
    } catch {
        return false;
    }
}

apkBtn.addEventListener("click", async () => {

    const exists = await fileExists(APK_PATH);

    if (exists) {

        window.open(APK_PATH, "_blank");

    } else {

        alert("Android APK is coming soon. Launching web version instead.");

        window.open(PWA_URL, "_blank");

    }

});

pwaBtn.addEventListener("click", () => {

    window.open(PWA_URL, "_blank");

});

exeBtn.addEventListener("click", () => {

    alert("Desktop version coming soon.");

});