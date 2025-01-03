---
layout: layout.vto
---

# Getrafty

This project aims to provide a variety of write-ups and exercises on distributed backend systems, offering an overview of the basic concepts. 
Whether you've been curious about how [distributed file systems](https://static.googleusercontent.com/media/research.google.com/en//archive/gfs-sosp2003.pdf) function or wanted to explore the inner workings of [your favorite RPC framework](https://en.wikipedia.org/wiki/Apache_Thrift), you're in the right place. 
Here, you'll have the opportunity to build a fully functional toy version yourself.

The exercises are mainly standalone tasks, each focusing on a specific topic. Every exercise includes a C++ boilerplate implementation that you will need to modify.

Please keep your forked repository private and refrain from sharing your solutions publicly. Thank you! ❤️

Get ready 🍿

![Scenes from distributed systems](/static/img/scenes-from-distributed-systems.webp)

*~ [scenes from distributed systems, X (Twitter)](https://x.com/b0rk/status/1056560207562711041)*

## Catch

[Why do we need distributed systems anyway?](https://brooker.co.za/blog/2020/01/02/why-distributed.html)

## Navigation 🗺️

- [How to work with this repository](getting-started)
  - [Tutorial](tutorial)
- Index
  - [Remote Procedure Calls @I. Thread pool](/thread-pool)
  - [Remote Procedure Calls @II. IO](/rpc-io)
  - 🚧 [Remote Procedure Calls @III. Calling functions](#)
  - 🚧 [Filesystem @I.Accessing remotely over RPC](#)
  - 🚧 [Filesystem @II. Surviving node failures](#)

- Misc.
  - [Install Docker](etc/use-docker)
  - [SSH to dev container](etc/connect-over-ssh)
  - [How to use this repository with VSCode](etc/use-vscode)

- [FAQ](etc/faq)

## Contributing

This is a very early exploration that is yet to be proved to be useful; the contents are very immature and incomplete.  If you want to contribute, *you are very welcome*! [File an issue](https://github.com/getrafty-org/getrafty/issues/new), and we will chat.
If you have found a bug, please create an issue (or pull request) [in the repository](https://github.com/getrafty-org/getrafty).


## License

The source and documentation are released under the [MIT License](https://github.com/getrafty-org/getrafty/blob/main/LICENSE).

---
*How did "Getrafty" get its name? I found it to be an amusing twist on words. One of the main concepts touched on in the workbook is the [Raft Consensus Algorithm](https://raft.github.io/)*.
