export default function ImgCap({ title, href }) {
    return (
        <a data-component="ImgCap" href={href} className={"img-cap"}>{title}</a>
    );
}
