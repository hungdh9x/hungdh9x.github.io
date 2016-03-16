---
layout: post
cover: 'assets/images/cover7.jpg'
title: Triển khai GCM với Android
date:   2016-01-14 10:18:00
tags: android, gcm
subclass: 'post tag-test tag-content'
categories: 'hungdh'
navigation: True
logo: 'assets/images/ghost.png'
---

Bạn có một ứng dụng, bạn muốn gửi thông báo cho tất cả client mà không muốn mất phí.
Điều đó hoàn toàn có thể thực hiện được nếu bạn sử dụng dịch vụ Google Cloud Messaging (GCM) do Google cung cấp.
GCM là dịch vụ giúp bạn tương tác giữa client - server thông qua máy chủ GCM.
Trong bài viết này, mình sẽ giới thiệu, hướng dẫn các bạn các bước cơ bản để xây dựng ứng dụng Android sử dụng GCM (bao gồm cả client lẫn server).

#1 Mô hình, cách vận hành của GCM
![Sơ đồ vận hành của GCM](/assets/images/2016/01/gcm-diagram.png)

Quá trình hoạt động như sau:

1. Client gửi `senderID`, `application id` tới `GCM server` để đăng kí.
2. Nếu các thông số hợp lệ, `GCM server` sẽ trả về `registration id` cho client.
3. Sau khi nhận được `registration id` mà `GCM server` trả về, client sẽ  gửi `registration id` này lên server (do ta tự xây dựng).
4. Server nhận `registration id` và lưu nó vào CSDL (phục vụ cho việc quản lý, gửi thông báo sau này).
5. Mỗi khi muốn thông báo tới client, server sẽ gửi yêu cầu tới `GCM server` với danh sách các `registration id`.
6. `GCM server` sẽ thông báo tin nhắn tới các client (dựa vào `registration id` mà server cung cấp).

**Đăng kí với Google Cloud Messaging**

Để có được `senderID`, `application id` hãy làm như sau:

1. Truy cập tới: [https://developers.google.com/mobile/](https://developers.google.com/mobile/add?platform=android&cntapi=gcm) để tạo nhanh project.
2. Tại đây, bạn cần nhập `App name` và `package name` vào khung tương ứng. Sau đó chọn tiếp tục.

![Đăng kí API cho ứng dụng](/assets/images/2016/01/gcm-registration-api-1.png)

3. Ở bước này, bạn sẽ bật các API dùng cho ứng dụng của mình (ở đây chỉ demo GCM nên mình chỉ bật Cloud Messaging) bằng cách nhấn vào `Enable Cloud Messaging`.
Kết quả thu được:

![Đăng kí API cho ứng dụng](/assets/images/2016/01/gcm-registration-api-2.png)

Bạn có thể thấy 2 giá trị mà mình cần sử dụng: **Server API Key** (đươc sử dụng khi server gửi yêu cầu tới GCM server), **Sender ID** (dùng cho client).

4. Nhấn `Generate configuration files` để tạo file `google-service.json`, đây là file config được sử dụng tại client.
Cuối cùng là tải file `google-service.json`, và di chuyển vào thư mục `/app/` trong project của bạn.

  Bạn có thể tham khảo tài liệu hướng dẫn chính thức của Google [tại đây](https://developers.google.com/cloud-messaging/android/client?configured=true)

#2 Triển khai ứng dụng.

Ở trong bài viết này, mình sẽ hướng dẫn xây dựng server side trước, phía client sẽ có trong bài viết tiếp theo.

##2.1 Xây dựng Server side

Trong tutorial này, mình sẽ sử dụng `PHP` để xây dựng server cũng như `MySQL` làm cơ sở dữ liệu. 

**Xây dựng CSDL**

1. Mở phpmyadmin để tạo database với tên là `gcm`.
2. Vào database `gcm` và truy vấn câu query dưới để tạo bảng `gcm_users`
<script src="https://gist.github.com/hungdh0x5e/9feae65b241f36fb248e.js"></script>

**Xây dựng server**

1. Tạo file `config.php` để lưu thông tin về database và google api key.

{% highlight php}
<?php
/**
 * Database config variables
 */
define("DB_HOST", "localhost");
define("DB_USER", "root");
define("DB_PASSWORD", "123456");
define("DB_DATABASE", "gcm");
/*
 * Google API Key
 */
define("GOOGLE_API_KEY", "AIzaSyA7mqASFSAFASFSAEbDDEpDpJ6kViqJE"); 
?>
{% endhighlight %}

<script src="https://gist.github.com/hungdh0x5e/d672489ff2c48cb70ea7.js"></script>
2. Một file khác `db_connect.php` để tiến hành kết nối với CSDL (bao gồm việc open và close).
<script src="https://gist.github.com/hungdh0x5e/3383e5f729c5053d72db.js"></script>
3. File `db_functions.php` chứa các phương thức thao tác với CSDL như thêm mới (storeUser), lấy toàn bộ danh sách user (getAllUsers). 
Bạn có thể xem nội dung chi tiết [tại đây](https://gist.github.com/hungdh0x5e/6f04d2e4b205d440ac1d);
4. File `GCM.php` dùng để gửi yêu cầu thông báo tới GCM server.
<script src="https://gist.github.com/hungdh0x5e/ff98e4007e4aec0b2aba.js"></script>
5. Tạo file `register.php` để nhận truy vấn từ client, và lưu trữ thông tin vào trong CSDL. 
các tham số client cần phải gửi `name`, `email`, `registration id`.
<script src="https://gist.github.com/hungdh0x5e/77c3836a45b76f9e58fa.js"></script>
6. Tạo file `send_message.php` để gửi thông báo tới client thông qua GCM server.
<script src="https://gist.github.com/hungdh0x5e/76ff3d300b1007d92de0.js"></script>
7. Cuối cùng là tạo file `index.php` có nhiệ̣m vụ̣ hiể̉n thị̣ danh sách các client đã đăng kí , và cho phép gửi tin nhắn tới từng thiết bị̣. Do code khá dài nên mình sẽ dẫn link để các bạn tham khảo.
[index.php](https://gist.github.com/hungdh0x5e/a193f86ddbe2c234ba99)

Như vậy là đã xây dựng xong server side, giao diện quản lý sẽ tương tự như sau
![Giao diện quản lý](/assets/images/2016/01/gcm-admin.png)

<script src="https://gist.github.com/hungdh0x5e/58ee362e8b18946f938c.js"></script>

**Lưu ý:** Chỉ xây dựng `client side` khi bạn đã xây dựng `server side` thành công.

Trong bài viết tiếp theo, mình sẽ hướng dẫn cách xây dựng phía `client`.

Toàn bộ code phần server bạn có thể tham khảo [tại đây](https://github.com/hungdh0x5e/GoogleCloudMessaging/tree/master/gcm)
