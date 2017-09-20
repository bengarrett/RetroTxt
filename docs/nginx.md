
## Configure NGINX to serve ASCII & ASCII art

### A barebones configuration to serve plain text files using [NGINX](https://www.nginx.com).

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

### Explanation

```nginx
location /ansi {
    types {
        text/plain asc ans txt;
    }
}
```

Broken down the `location` block applies the configuration only to files using the path http://example.com/ansi/. While the `types` block filters that further to only use the configuration with files using an `asc` `ans` or `txt` file extension.

`charset "ISO-8859-1"` directive combined with the `types { text/plain }` block will add a **`Content-Type:text/plain; charset=ISO-8859-1`** response header. It tells the browser to treat the file as plain text encoded as [ISO-8859-1](https://en.wikipedia.org/wiki/ISO/IEC_8859-1), which is a legacy character set RetroTxt can understand. You cannot use [CP-437](https://en.wikipedia.org/wiki/Code_page_437) or other DOS code pages as they are not [valid browser encodings](https://encoding.spec.whatwg.org/#legacy-single-byte-encodings).

`add_header Content-Disposition "inline";` directive adds a **`Content-Disposition:inline`** response header that tells the browser to display the content in a tab.

`add_header X-Content-Type-Options "nosniff";` directive adds the **`X-Content-Type-Options:nosniff`** response header to tell browsers not to MIME sniff the content. [MIME sniffing](https://en.wikipedia.org/wiki/Content_sniffing) often inaccurately treats ANSI and other encoded text as binary files which browsers download. Unfortunately, [Firefox ignores this header request](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options).

![Chrome network console headers result](assets/nginx_network_console.png)
