import React, { useEffect, useMemo, useState } from "https://esm.sh/react@18";
import PostList from "./PostList.jsx";

export default function SearchIndex({ posts = [] }) {
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (posts || []).filter(p => {
            if (!q) return true;
            return (
                (p.title || "").toLowerCase().includes(q) ||
                (p.author || "").toLowerCase().includes(q) ||
                (p.tags || []).some(t => t.toLowerCase().includes(q))
            );
        });
    }, [posts, query]);

    useEffect(() => {
        const fallback = document.querySelector('[data-fallback="post-list"]');
        fallback?.remove();
    }, []);

    return (
        <section className="search-index" data-component="SearchIndex" data-count={(posts || []).length}>
            <input
                type="search"
                className="search-input"
                placeholder="Search posts by title, tag, or author"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search posts"
                autoComplete="off"
            />

            {filtered.length > 0 ? (
                <PostList posts={filtered} />
            ) : (
                <p className="search-empty">No matches.</p>
            )}
        </section>
    );
}
