export default function Oops({ initialCount = 0 }) {
    return (
        <div data-component="Oops">
            <p>Have questions? Check <a href={"/etc/faq/"}>Q&A</a> for most common issues or file an issue on the <a href={"https://github.com/getrafty-org/getrafty/issues"}>GitHub</a>.</p>
        </div>
    );
}
