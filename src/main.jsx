import React from "https://esm.sh/react@18";
import ReactDOM from "https://esm.sh/react-dom@18";
import Counter from "./_components/Counter.jsx";

const el = document.querySelector("[data-component='Counter']");
if (el) {
    ReactDOM.hydrateRoot(el, <Counter ssrCount={parseInt(el.dataset.ssrCount || "0", 10)} />);
}

export const themes = {
    light: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css",
    dark: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css",
};

export async function setThemeAsync(currentTheme) {
    document.documentElement.dataset.theme = currentTheme;
    localStorage.setItem("theme", currentTheme);
    document.getElementById("highlight-theme").href = themes[currentTheme];

    const images = Array.from(document.querySelectorAll("img"));
    await Promise.all(images.map((image) => setupImageCanvasAsync(image, currentTheme)));

    requestAnimationFrame(() => hljs.highlightAll());
}

export async function setupImageCanvasAsync(image, theme) {
    const canvas = await getOrAttachCanvas(image);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    image.style.display = "none";
    if (theme === "dark") {
        darkenImage(ctx);
    }
}

export async function getOrAttachCanvas(image) {
    if (!image.dataset.originalSrc) {
        image.dataset.originalSrc = image.src;
    }
    let canvas =
        image.nextElementSibling?.tagName === "CANVAS" ? image.nextElementSibling : null;
    if (canvas) {
        return canvas;
    }
    canvas = document.createElement("canvas");
    canvas.className = "imageCanvas";
    const styles = getComputedStyle(image);
    Object.assign(canvas.style, {
        width: styles.width,
        height: styles.height,
        display: "block",
        objectFit: styles.objectFit,
        maxWidth: styles.maxWidth,
        maxHeight: styles.maxHeight,
    });
    image.parentNode.insertBefore(canvas, image.nextSibling);
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    return canvas;
}

export function darkenImage(ctx) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const darkR = 13,
        darkG = 17,
        darkB = 23;
    const whiteThreshold = 230;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i],
            g = data[i + 1],
            b = data[i + 2];
        if (0.2126 * r + 0.7152 * g + 0.0722 * b > whiteThreshold) {
            data[i] = darkR;
            data[i + 1] = darkG;
            data[i + 2] = darkB;
        } else {
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

export function addAnchorsToHeaders() {
    document.querySelectorAll("h1, h2, h3").forEach((header) => {
        if (!header.id) {
            const slug = header.textContent
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "");
            header.id = slug;

            const anchor = document.createElement("a");
            anchor.href = `#${slug}`;
            anchor.className = "anchor-link";
            anchor.textContent = header.textContent;

            header.textContent = "";
            header.appendChild(anchor);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".theme-toggle").addEventListener("click", async () => {
        const newTheme =
            document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        await setThemeAsync(newTheme);
    });

    addAnchorsToHeaders();
});

window.addEventListener("load", async () => {
    const initialTheme =
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    await setThemeAsync(initialTheme);
});