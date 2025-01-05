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

export default site;
