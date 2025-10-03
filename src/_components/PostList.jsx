export default function PostList({ posts = [] }) {
    if (!Array.isArray(posts) || posts.length === 0) {
        return <p className="search-empty">No posts yet.</p>;
    }

    const formatDate = (value) => {
        if (!value) {
            return { display: "", iso: undefined };
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return { display: String(value), iso: undefined };
        }
        const day = String(date.getUTCDate()).padStart(2, "0");
        const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
        const year = date.getUTCFullYear();
        return {
            display: `${day} ${month}, ${year}`,
            iso: date.toISOString(),
        };
    };

    return (
        <ol className="post-list">
            {posts.map((post, idx) => {
                const { display, iso } = formatDate(post.date);

                return (
                    <li key={idx} className="post-item">
                        <time className="post-date" dateTime={iso}>
                            {display || "—"}
                        </time>
                        <a
                            href={post.url}
                            className="post-link"
                            target={post.external ? "_blank" : undefined}
                            rel={post.external ? "noopener noreferrer" : undefined}
                        >
                            {post.title}
                            {post.external && <span className="external-indicator" aria-hidden="true">↗</span>}
                        </a>
                        {post.author && (
                            <span className="post-author">@{post.author}</span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
