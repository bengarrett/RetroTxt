---
hide:
  - toc
---
# Serve ANSI, ASCII & BBS art

Below is a barebones configuration to serve plain text files using [Nginx](https://www.nginx.com). The `#!nginx location` block applies the configuration only to files using the path `http://example.com/ansi`. The served textfiles are in `/var/www/example.com/html`.

```nginx title="nginx.conf" linenums="1"
server {
    listen 80;
    root /var/www/example.com/html;

    location /ansi {
        charset "ISO-8859-1";
        add_header Content-Disposition "inline";
        add_header X-Content-Type-Options "nosniff";
        types {
            text/plain asc ans txt;
        }
    }
}
```

---

```nginx title="Types" hl_lines="2-4"
location /ansi {
    types {
        text/plain asc ans txt;
    }
}
```

The `types` block further filter files to those utilising an `.asc` `.ans` or `.txt` file extension.

---

```nginx title="Charset" hl_lines="2"
location /ansi {
    charset "ISO-8859-1";
}
```

The `#!nginx charset "ISO-8859-1"` directive combined with the `#!nginx types { text/plain }` block adds a *`Content-Type:text/plain; charset=ISO-8859-1`* response header.

It tells the browser to treat the file as plain text encoded as [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1), a legacy character set RetroTxt can understand. You cannot use [CP-437](https://en.wikipedia.org/wiki/Code_page_437) or other DOS code pages as they are not [valid browser encodings](https://encoding.spec.whatwg.org/#legacy-single-byte-encodings).

---

```nginx title="Content disposition" hl_lines="2"
location /ansi {
    add_header Content-Disposition "inline";
}
```

The `#!nginx add_header Content-Disposition "inline";` directive adds a *`Content-Disposition:inline`* response header that tells the browser to display the content in a tab.

---

```nginx title="No sniff" hl_lines="2"
location /ansi {
    add_header X-Content-Type-Options "nosniff";
}
```

The `#!nginx add_header X-Content-Type-Options "nosniff";` directive adds the *`X-Content-Type-Options:nosniff`* response header to tell browsers not to sniff the content.

[MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often inaccurately treats ANSI and other encoded text as binary files browsers download. Unfortunately, [Firefox ignores this header request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options).

<figure markdown>
  ![Chrome network console headers result](../assets/nginx-network-headers.png)
  <figcaption>Response headers</figcaption>
</figure>