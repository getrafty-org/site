import lume from "lume/mod.ts";
import { ensureDir, walk } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

// Get the current site version based on Git metadata
async function getSiteVersion() {
    try {
        const [tag, branch, commit] = await Promise.all([
            Deno.run({ cmd: ["git", "describe", "--tags", "--exact-match"], stdout: "piped" }).output()
                .then(output => new TextDecoder().decode(output).trim())
                .catch(() => ""),
            Deno.run({ cmd: ["git", "rev-parse", "--abbrev-ref", "HEAD"], stdout: "piped" }).output()
                .then(output => new TextDecoder().decode(output).trim())
                .catch(() => ""),
            Deno.run({ cmd: ["git", "rev-parse", "--short", "HEAD"], stdout: "piped" }).output()
                .then(output => new TextDecoder().decode(output).trim())
                .catch(() => ""),
        ]);

        return tag || `@${branch}-${commit}`;
    } catch {
        return "@latest";
    }
}

// Handle after-build actions: copy files and update links
async function afterBuildHandler(baseDir = "./_site") {
    const version = await getSiteVersion();
    const versionPath = path.join(baseDir, version);
    console.log(`Building version-specific directory: ${versionPath}`);
    await ensureDir(versionPath);

    for await (const { path: filePath, isFile } of walk(baseDir, { includeDirs: false })) {
        const relativePath = path.relative(baseDir, filePath);

        if (relativePath.startsWith(version)) continue; // Skip the version directory itself

        const targetPath = path.join(versionPath, relativePath);
        await ensureDir(path.dirname(targetPath));

        if (isFile) {
            const content = await Deno.readTextFile(filePath);
            const updatedContent = relativePath.endsWith(".html")
                ? content.replace(/href="([^"]+)"/g, (match, href) => {
                    if (href.startsWith("http") || href.startsWith("#")) return match; // Skip external and anchor links
                    return `href="${href.startsWith("/") ? `/${version}${href}` : `/${version}/${href}`}"`;
                })
                : content;

            await Deno.writeTextFile(targetPath, updatedContent);
        }
    }

    console.log(`Version-specific directory created: ${versionPath}`);
}


const site = lume({ src: "./src", dest: "./_site", emptyDest: false });
site.addEventListener("afterBuild", () => afterBuildHandler());
export default site;
