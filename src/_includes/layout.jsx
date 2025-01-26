import React, { useEffect } from "https://esm.sh/react@18";

export default function Layout({ children }) {
    return (
        <html lang="en" data-theme="light">
        <head>
            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <meta name="robots" content="index, follow"/>
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8"/>
            <meta name="supported-color-schemes" content="light dark"/>
            <meta name="theme-color" content="hsl(220, 20%, 100%)" media="(prefers-color-scheme: light)"/>
            <meta name="theme-color" content="hsl(220, 20%, 10%)" media="(prefers-color-scheme: dark)"/>
            <link rel="stylesheet" href="/static/main.css"/>
            <link rel="stylesheet" href="/static/icomoon.css"/>
            <link
                id="highlight-theme"
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
            />
            <link rel="icon" type="image/png" sizes="32x32" href="/static/img/rafty.svg"/>
            <title>Getrafty.org</title>
            <meta name="description"
                  content="Write-ups and exercises on distributed backend systems, offering an overview of the basic concepts. Whether you've been curious about how distributed file systems function or wanted to explore the inner workings of your favorite RPC framework, you're in the right place. Here, you'll have the opportunity to build a fully functional toy version yourself."/>
            <meta name="keywords"
                  content="distributed systems, backend systems, raft consensus algorithm, c++ exercises, rpc framework, distributed file systems, fault-tolerant systems, queues and thread pools, basic primitives, toy implementations of systems, distributed file server, remote procedure calls, distributed backend tutorials, contributing to distributed systems, basics of distributed systems, rafty exercises, getrafty, learn distributed systems, c++ exercises, file server exercises, scenes from distributed systems"/>
        </head>
        <body>
        <header>
            <nav className="navbar">
                <ul className="navbar-links">
                    <li>
                        <button className="button theme-toggle">
                            <a className="icon icon-magic" aria-hidden="true"></a>
                        </button>
                    </li>
                    <li>
                        <button className="button">
                            <a
                                className="icon icon-github"
                                aria-hidden="true"
                                href="https://github.com/getrafty-org"
                                target="_blank"
                                rel="noopener noreferrer"
                            ></a>
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
        <main>
            <a href="/index">cd ~/</a>
            {children}
        </main>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"/>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js"/>
        <script type="module" src="/static/main.js"/>
        </body>
        </html>
    );
}
