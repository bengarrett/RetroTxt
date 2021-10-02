# Configure Nginx to serve ANSI, ASCII & BBS art

## A barebones configuration to serve plain text files using [Nginx](https://www.nginx.com).

```nginx
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

## Explanation

```nginx
location /ansi {
    types {
        text/plain asc ans txt;
    }
}
```

#### Broken down the `location` block applies the configuration only to files using the path http://example.com/ansi. While the `types` block further filters files utilising an `asc` `ans` or `txt` file extension.

- _`charset "ISO-8859-1"`_ directive combined with the `types { text/plain }` block will add a **`Content-Type:text/plain; charset=ISO-8859-1`** response header. It tells the browser to treat the file as plain text encoded as [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1), which is a legacy character set RetroTxt can understand. You cannot use [CP-437](https://en.wikipedia.org/wiki/Code_page_437) or other DOS code pages as they are not [valid browser encodings](https://encoding.spec.whatwg.org/#legacy-single-byte-encodings).

- _`add_header Content-Disposition "inline";`_ directive adds a **`Content-Disposition:inline`** response header that tells the browser to display the content in a tab.

- _`add_header X-Content-Type-Options "nosniff";`_ directive adds the **`X-Content-Type-Options:nosniff`** response header to tell browsers not to MIME sniff the content. [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often inaccurately treats ANSI and other encoded text as binary files which browsers download. Unfortunately, [Firefox ignores this header request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options).

![Chrome network console headers result](assets/nginx-network-headers.png)
