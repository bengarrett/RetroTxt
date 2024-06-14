---
title: "Caddy, ANSI, ASCII & BBS art"
summary: Configure Caddy to serve plain text and ANSI text files.
authors:
    - Ben Garrett
date: 2024-06-14
hide:
  - toc
---
# Serve ANSI, ASCII & BBS art

Below is a barebones configuration using [Caddy](https://caddyserver.com) to only to serve files using the URL `example.com/ansi/`.

The served textfiles are located at `/var/www/example.com/html`.

```nginx title="Caddyfile" linenums="1"
example.com {
  encode zstd gzip

  handle {
      redir /ansi /ansi/
  }

  handle_path /ansi/* {
    root * /var/www/example.com/html/ansi
    file_server
    header {
      Content-Type "text/plain; charset=iso-8859-1"
      X-Content-Type-Options nosniff
    }
  }
}
```

---

```nginx title="Encode" hl_lines="2"
example.com {
  encode zstd gzip
```

The `#!nginx encode` directive compresses the served files using the [Zstandard](https://facebook.github.io/zstd/) and [Gzip](https://www.gzip.org/) algorithms to reduce the file size and speed up the text file downloads.

---

```nginx title="Handle path" hl_lines="1"
  handle_path /ansi/* {
    root * /var/www/example.com/html/ansi
    file_server
```

The `#!nginx handle_path` directive applies the configuration to all files using the path `/ansi/*`.

---

```nginx title="Root" hl_lines="2-3"
  handle_path /ansi/* {
    root * /var/www/example.com/html/ansi
    file_server
```

The `#!nginx root` paired with the `#!nginx file_server` directive sets the (virtual) root directory to `/var/www/example.com/html/ansi`.

---

```nginx title="Content type" hl_lines="2"
    header {
      Content-Type "text/plain; charset=iso-8859-1"
      X-Content-Type-Options nosniff
    }
```

The `#!nginx header` directive combined with the `#!nginx Content-Type "text/plain; charset=iso-8859-1"` block adds a response header to tell the browser to treat the file as plain text encoded as [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1), a legacy character set RetroTxt can understand. You cannot use [CP-437](https://en.wikipedia.org/wiki/Code_page_437) or other DOS code pages as they are not [valid browser encodings](https://encoding.spec.whatwg.org/#legacy-single-byte-encodings).

---

```nginx title="No sniff" hl_lines="3"
    header {
      Content-Type "text/plain; charset=iso-8859-1"
      X-Content-Type-Options nosniff
    }
```

The `#!nginx X-Content-Type-Options nosniff` directive adds the response header to tell browsers not to sniff the content. [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often inaccurately treats ANSI and other encoded text as binary files browsers download.
