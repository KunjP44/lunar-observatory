const apkBtn = document.getElementById("download-apk");
const desktopBtn = document.getElementById("download-desktop");

const winBtn = document.getElementById("download-windows");
const linuxAppBtn = document.getElementById("download-linux-appimage");
const linuxDebBtn = document.getElementById("download-linux-deb");

const desktopOptions = document.getElementById("desktop-options");

const pwaBtn = document.getElementById("launch-pwa");

const APK_URL =
    "https://github.com/KunjP44/lunar-observatory/releases/latest/download/lunar-observatory.apk";

const WINDOWS_URL =
    "https://github.com/KunjP44/lunar-observatory/releases/latest/download/Lunar-Observatory-win.exe";

const LINUX_APPIMAGE =
    "https://github.com/KunjP44/lunar-observatory/releases/latest/download/Lunar-Observatory-linux.AppImage";

const LINUX_DEB =
    "https://github.com/KunjP44/lunar-observatory/releases/latest/download/Lunar-Observatory-linux.deb";

const PWA_URL =
    "https://kunjp44.github.io/lunar-observatory-app/";

apkBtn?.addEventListener("click", () => {
    window.open(APK_URL, "_blank");
});

desktopBtn?.addEventListener("click", () => {

    desktopOptions.style.display =
        desktopOptions.style.display === "flex"
            ? "none"
            : "flex";

});

winBtn?.addEventListener("click", () => {
    window.open(WINDOWS_URL, "_blank");
});

linuxAppBtn?.addEventListener("click", () => {
    window.open(LINUX_APPIMAGE, "_blank");
});

linuxDebBtn?.addEventListener("click", () => {
    window.open(LINUX_DEB, "_blank");
});

pwaBtn?.addEventListener("click", () => {
    window.open(PWA_URL, "_blank");
});