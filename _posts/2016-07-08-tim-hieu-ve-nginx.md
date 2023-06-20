---
layout: post
cover: 'assets/images/2016/06/nginx.png'
navigation: True
title: Tìm hiểu nginx
date: 2016-07-18 12:00:00
tags: content nginx
subclass: 'post tag-content'
logo: 'assets/images/ghost.png'
author: 'hungdh'
categories: 'hungdh'
---

#### I. Nginx là gì ?

1. **Khái niệm**
* Nginx (engine x) là một web server (tương tự apache), vượt trội về khả năng xử lý các file tĩnh so với apache (mạnh về xử lý các file động). Nó có thể đóng vai trò là một reverse proxy cho các giao thức: HTTP, HTTPS, IMAP, POP3, SMTP cũng như hỗ trợ cân bằng tải (load balancer).
* Nginx được viết bởi [Igor Sysoev](http://sysoev.ru/en/), được công bố năm 2002. Nginx chạy trên Unix, Linux, các biến thể BSD, Mac OS X, Solaris, AIX, HP-UX và Microsoft Windows.

2. **Tính năng**

a. Basic HTTP server features

* Xử lý các file tĩnh và file index, tự động đánh index
* Tăng tốc reverse proxy với việc caching, cân bằng tải (load banlancing), khả năng chịu lỗi (fault tolerance)
* Hỗ trợ tăng tốc caching với FastCGI, SCGI, uwsgi
* Hỗ trợ giao thức SSL, TLS SNI, HTTP/2
* Tạo virtual host
* Giới hạn số kết nối, yêu cầu từ một địa chỉ IP
* Kiểm soát truy cập bởi: địa chỉ IP, mật khẩu (HTTP basic authentication) và từ các yêu cầu con (subrequest)

b. TCP/UDP proxy server features

* Load balancing and fault tolerance
* Access control based on client address

c. Mail proxy server features

* Chứng thực người dùng sử dụng HTTP authentication và chuyển hướng kết nối tới SMTP server bên trong.
* Hỗ trợ: POP3, IMAP, SMTP, SSL, STARTTLS and STLS

#### II. Cài đặt, cấu hình virtual host

Cài đặt nginx:

```shell
$ apt-get install nginx
```

_Core Context_

##### The main context

Tên gọi phổ biến là `main` hay `global` context. Đây là context duy nhất mà không chứa trong bất kì context (context block) nào khác.

```ruby
# The main context is here, outside any other contexts
context {
  ...
}
```

Các thông số phổ biến trong main context: the number of workers, the file to save the main process's ID

##### The event context

Chứa trong `main context`, được sử dụng để thiết lập các global option ảnh hưởng đến cách nginx xử lý các kết nối chung. Và context này là duy nhất trong nginx configure

```
events {
    worker_connections 768;
    # multi_accept on;
}
```

##### The HTTP context

Trong khi cấu hình nginx như một web server hay reverse proxy, `http` context sẽ giữ đa số các cấu hình. Context này sẽ chứa tất cả các tiêu chí, các context cần thiết khác để định nghĩa cách chương trình sẽ handle các kết nối HTTP, HTTPS. Và nó ngang hàng với `event context`

```
http {
   ...
}
```

Một vài tiêu chí:

- Đường dẫn cho log (`access_log`, `error_log`)
- Cấu hình hiển thị khi server lỗi (`error_page`)
- Tiêu chí nén (`gzip`, `gzip_disable`)
- TCP keep alive (`keepalive_disable`, `keepalive_requests`, `keepalive_timeout`)
- Các luật (rule) mà Nginx sẽ làm theo để cố gắng tối ưu hóa gói tin và system call (`sendfile`, `tcp_nodelay`, `tcp_nopush`)
- Thư mục chứa website (`root`), index file (`index`)

##### The Server context

Được định nghĩa bên trong `http context`. Đây là phần giúp ta cấu hình virtual host.

- `listen`: Địa chỉ IP, port được thiết kế để nhận response. Nếu yêu cầu từ client có giá trị trùng với trường này, block này sẽ được lựa chọn để xử lý kết nối.
- `server_name`: để kiểm tra map với domain từ request, nếu trùng sẽ đẩy request đến host này.
- Ngoài ra còn có một số tiêu chí (có thể định nghĩa trong `http context`) như logging, document root, compression, ...

##### The Location context

`Location context` chứa các config ứng với mỗi khu vực trong `server context`

```
server {
    server_name example.com;

    location /upload {
        ...
    }

    location /admin {
        ...
    }
}
```

Như example trên, khi người dùng truy cập vào url `http://example.com/upload` sẽ map với các rule trong location `upload`. Tương tự với location `admin`. Điều này giúp ta có thể thiết lập các chính sách truy cập phù hợp với từng khu vực.

VD:

* Cấm mọi truy cập tới khu vực `admin` trừ các IP trong dải mạng `192.168.1.0/24`

```
location /admin {
    allow 192.168.1.0/24;
    deny all;
}
```

Các tiêu chí xuất hiện trong `location context`:

* `root /data;`: thêm đường dẫn.
* `proxy_pass $IP_proxy`: chuyển request tới $IP\_proxy - sử dụng để thiết lập nginx như reverse proxy
* `return 404;`: return status code, or redirect `return 301 http://www.example.com/moved/here;`
* `rewrite`: rewrite url
* `sub_filter` : rewrite HTTP response

Reference:
- [Nginx web-server](https://docs.nginx.com/nginx/admin-guide/web-server/web-server/)
- [nginx-http-core](https://nginx.org/en/docs/http/ngx_http_core_module.html#variables)
