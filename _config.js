import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import mdx from "lume/plugins/mdx.ts";
import esbuild from "lume/plugins/esbuild.ts";
import robots from "lume/plugins/robots.ts";
import sitemap from "lume/plugins/sitemap.ts";

const site = lume({ src: "./src", dest: "./_site", emptyDest: true });

site.use(jsx());
site.use(mdx());
site.use(
    esbuild({
        extensions: [".jsx"],
        options: {
            outdir: "static",
            entryPoints: ["main.jsx"], // Hydration entry
            bundle: true,
            minify: true,
        },
    })
);
site.use(robots({
    allow: "*"
}));

site.use(sitemap({
    lastmod: "lastmod",
}));

site.preprocess([".html"], (pages) => {
    for (const page of pages) {
        const info = page.src.entry?.getInfo();
        page.data.lastmod = info?.mtime;
    }
});

site.copy("_includes/static", "static/")

// Load threads data (legacy compatibility)
site.loadData([".json"]);

function normalizeDate(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString();
}

function toTagList(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.map((tag) => String(tag).trim()).filter(Boolean);
    }
    const normalized = String(value).replace(/[\[\]]/g, "");
    return normalized
        .split(",")
        .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
}

function parseKeyValue(content) {
    const data = {};
    if (!content) return data;
    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const sep = line.indexOf(":");
        if (sep === -1) continue;
        const key = line.slice(0, sep).trim().toLowerCase();
        if (!key) continue;
        let value = line.slice(sep + 1).trim();
        value = value.replace(/^['"]+|['"]+$/g, "");
        data[key] = value;
    }
    return data;
}

function parseFrontmatterBlock(content) {
    if (!content) return {};
    const match = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (!match) return {};
    const block = match[1];
    const data = {};
    for (const rawLine of block.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const sep = line.indexOf(":");
        if (sep === -1) continue;
        const key = line.slice(0, sep).trim().toLowerCase();
        if (!key) continue;
        let value = line.slice(sep + 1).trim();
        value = value.replace(/^['"]+|['"]+$/g, "");
        data[key] = value;
    }
    return data;
}

// Automatically discover and load threads at build time
site.addEventListener("beforeBuild", async () => {
    const { readdir, readFile, stat, writeFile } = await import("node:fs/promises");
    const { join } = await import("node:path");

    const threads = [];
    const allPosts = [];
    const threadsDir = "./src/threads";

    try {
        const userFolders = await readdir(threadsDir);

        for (const folder of userFolders) {
            const threadPath = join(threadsDir, folder);
            const folderStat = await stat(threadPath);
            if (!folderStat.isDirectory()) continue;

            const author = folder.replace(/@/g, "/");
            let threadTitle = folder;
            let threadDescription = "";
            let threadStatus = "active";
            let threadStarted = null;
            const threadTagsSet = new Set();

            const indexPath = join(threadPath, "index.mdx");
            let indexExists = true;
            try {
                const indexContent = await readFile(indexPath, "utf-8");
                const indexFront = parseFrontmatterBlock(indexContent);
                if (indexFront.title) threadTitle = indexFront.title;
                if (indexFront.description) threadDescription = indexFront.description;
                if (indexFront.status) threadStatus = indexFront.status;
                if (indexFront.started) {
                    const normalized = normalizeDate(indexFront.started);
                    if (normalized) threadStarted = normalized;
                }
                const indexTags = indexFront.tags ? toTagList(indexFront.tags) : [];
                indexTags.forEach((tag) => threadTagsSet.add(tag));
            } catch {
                indexExists = false;
            }

            const files = await readdir(threadPath);
            const postFiles = files
                .filter((f) => f.endsWith(".mdx") && f !== "index.mdx")
                .sort();

            const posts = [];
            const collectedDates = [];

            for (const file of postFiles) {
                const postPath = join(threadPath, file);
                const postContent = await readFile(postPath, "utf-8");
                const frontmatter = parseFrontmatterBlock(postContent);

                let title = frontmatter.title;
                if (!title) {
                    const headingMatch = postContent.match(/^#\s+(.+?)$/m);
                    if (headingMatch) {
                        title = headingMatch[1];
                    } else {
                        title = file.replace(/^\d+-/, "").replace(".mdx", "").replace(/-/g, " ");
                        title = title.charAt(0).toUpperCase() + title.slice(1);
                    }
                }

                const resolvedDate = normalizeDate(frontmatter.date);
                if (!resolvedDate) {
                    console.warn(`⚠️ Post ${folder}/${file} missing date metadata.`);
                } else {
                    collectedDates.push(resolvedDate);
                }

                const postAuthor = frontmatter.author
                    ? frontmatter.author.replace(/@/g, "/")
                    : author;

                const tagCandidates = frontmatter.tags ? toTagList(frontmatter.tags) : [];
                const fallbackTags = threadTagsSet.size > 0 ? Array.from(threadTagsSet) : [];
                const postTags = tagCandidates.length > 0 ? tagCandidates : fallbackTags;
                postTags.forEach((tag) => threadTagsSet.add(tag));

                const slug = file.replace(".mdx", "");

                const postData = {
                    file: slug,
                    title: title,
                    filename: file,
                    url: `/threads/${folder}/${slug}/`,
                    author: postAuthor,
                    username: folder,
                    tags: postTags,
                    date: resolvedDate,
                    external: false,
                };

                posts.push(postData);
                allPosts.push(postData);
            }

            for (const file of files) {
                if (!file.endsWith(".ref")) continue;
                const externalPath = join(threadPath, file);
                let info;
                try {
                    info = await stat(externalPath);
                } catch {
                    continue;
                }
                if (info.isDirectory()) continue;

                let content;
                try {
                    content = await readFile(externalPath, "utf-8");
                } catch {
                    continue;
                }

                if (!content.includes(":")) continue;
                const data = parseKeyValue(content);
                if (!data.title || !data.url) {
                    console.warn(`⚠️ External entry ${folder}/${file} missing title or url.`);
                    continue;
                }

                const externalAuthor = data.author ? data.author.replace(/@/g, "/") : author;
                const fallbackTags = threadTagsSet.size > 0 ? Array.from(threadTagsSet) : [];
                const externalTags = data.tags ? toTagList(data.tags) : fallbackTags;
                externalTags.forEach((tag) => threadTagsSet.add(tag));

                const externalDate = normalizeDate(data.date);
                if (externalDate) {
                    collectedDates.push(externalDate);
                } else {
                    console.warn(`⚠️ External entry ${folder}/${file} missing valid date.`);
                }

                const externalPost = {
                    file: file.replace(/\.ref$/i, ""),
                    title: data.title,
                    filename: file,
                    url: data.url,
                    author: externalAuthor,
                    username: folder,
                    tags: externalTags,
                    date: externalDate,
                    external: true,
                };

                posts.push(externalPost);
                allPosts.push(externalPost);
            }

            posts.sort((a, b) => {
                const timeA = a.date ? new Date(a.date).getTime() : 0;
                const timeB = b.date ? new Date(b.date).getTime() : 0;
                if (timeA === timeB) {
                    return a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
                }
                return timeB - timeA;
            });

            if (!threadStarted && collectedDates.length > 0) {
                const earliest = collectedDates
                    .map((value) => new Date(value).getTime())
                    .filter((time) => !Number.isNaN(time))
                    .sort((a, b) => a - b)[0];
                if (earliest) {
                    threadStarted = new Date(earliest).toISOString();
                }
            }

            const threadTags = Array.from(threadTagsSet);

            const threadData = {
                slug: folder,
                url: `/threads/${folder}/`,
                title: threadTitle,
                description: threadDescription,
                author: author,
                started: threadStarted,
                tags: threadTags,
                status: threadStatus,
                postCount: posts.length,
                posts: posts,
                username: folder,
            };

            threads.push(threadData);

            if (!indexExists && posts.length > 0) {
                const indexContent = `---
layout: layout.jsx
title: "${threadTitle}"
---

<nav className="breadcrumb">
  <li><a href="/">cd ~</a></li>
  <li>${folder}</li>
</nav>

# ${threadTitle}

${threadDescription}

## Posts

${posts.map((post, idx) => `${idx + 1}. [${post.title}](${post.external ? post.url : post.file})`).join('\n')}

---

**Author**: @${author}${threadTags.length ? ` · **Tags**: ${threadTags.map((t) => `#${t}`).join(' ')}` : ''}
`;
                await writeFile(indexPath, indexContent, 'utf-8');
                console.log(`📝 Auto-generated index for: ${folder}`);
            }
        }

        threads.sort((a, b) => new Date(b.started || 0) - new Date(a.started || 0));

        allPosts.sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });

        site.data("threads", threads);
        site.data("posts", allPosts);

        console.log(`✅ Discovered ${threads.length} thread(s) with ${allPosts.length} posts`);

    } catch (err) {
        console.error("Error loading threads:", err);
        site.data("threads", []);
        site.data("posts", []);
    }
});

export default site;
