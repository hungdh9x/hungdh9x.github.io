---
layout: post
cover: 'assets/images/2016/01/gcm.gif'
navigation: True
title: Triển khai GCM với Android (phần 2)
date: 2016-01-14 11:18:00
tags: android gcm content
subclass: 'post tag-content'
logo: 'assets/images/ghost.png'
author: 'hungdh'
categories: 'hungdh'
---

 <p>Ở phần một, mình đã giới thiệu GCM và hướng dẫn xây dựng được <code class="highlighter-rouge">server side</code>, phần tiếp theo sẽ là xây dựng <code class="highlighter-rouge">client side</code>. Let’s go!</p>

<p>Để tiếp tục phần hai, hãy chắc chắn bạn đã hoàn thành phần một (đã có file <code class="highlighter-rouge">google-service.json</code> trong thư mục <code class="highlighter-rouge">app</code> của project).</p>

<h4 id="1-khai-báo-thư-viện">1. Khai báo thư viện</h4>

<ul>
  <li>Tiến hành mở file <strong>build.gradle</strong> của <code class="highlighter-rouge">app</code> và khai báo như sau:</li>
</ul>

<div class="language-gradle highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="n">apply</span> <span class="nl">plugin:</span> <span class="s1">'com.google.gms.google-services'</span>
<span class="k">dependencies</span> <span class="o">{</span>
  <span class="n">compile</span> <span class="s2">"com.google.android.gms:play-services-gcm:8.4.0"</span>
<span class="o">}</span>
</code></pre></div></div>

<ul>
  <li>Tiếp tục mở file <strong>build.gradle</strong> của <code class="highlighter-rouge">project</code></li>
</ul>

<div class="language-gradle highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="k">dependencies</span> <span class="o">{</span>
    <span class="n">classpath</span> <span class="s1">'com.android.tools.build:gradle:1.5.0'</span>
    <span class="n">classpath</span> <span class="s1">'com.google.gms:google-services:2.0.0-alpha3'</span>
<span class="o">}</span>
</code></pre></div></div>

<p>Sau đó, tiến hành rebuild lại Project.</p>

<h4 id="2-khai-báo-gcm-permission">2. Khai báo GCM permission</h4>

<p>Ứng dụng cần truy cập Internet và <code class="highlighter-rouge">wake lock</code> để gửi, nhận thông báo từ GCM server.</p>

<div class="language-xml highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nt">&lt;manifest</span> <span class="na">package=</span><span class="s">"com.hungdh.gcmdemo"</span><span class="nt">&gt;</span>
  <span class="nt">&lt;uses-permission</span> <span class="na">android:name=</span><span class="s">"android.permission.INTERNET"</span> <span class="nt">/&gt;</span>
  <span class="nt">&lt;uses-permission</span> <span class="na">android:name=</span><span class="s">"android.permission.WAKE_LOCK"</span> <span class="nt">/&gt;</span>
  <span class="nt">&lt;uses-permission</span> <span class="na">android:name=</span><span class="s">"com.google.android.c2dm.permission.RECEIVE"</span> <span class="nt">/&gt;</span>
  <span class="nt">&lt;permission</span> <span class="na">android:name=</span><span class="s">"com.hungdh.gcmdemo.permission.C2D_MESSAGE"</span>
      <span class="na">android:protectionLevel=</span><span class="s">"signature"</span> <span class="nt">/&gt;</span>
  <span class="nt">&lt;uses-permission</span> <span class="na">android:name=</span><span class="s">"com.hungdh.gcmdemo.permission.C2D_MESSAGE"</span> <span class="nt">/&gt;</span>
<span class="nt">&lt;/manifest&gt;</span>
</code></pre></div></div>

<h4 id="3-code-code-và-code">3. Code, code, và code</h4>

<p>Cấu trúc chương trình: ngoài class Main ra thì ta cần 3 class với chức năng như sau:</p>

<ol>
  <li>
    <p><strong>RegistrationIntentService.java</strong>: một IntentService tiến hành tạo token và đăng kí token đó cho server mà ta đã xây dựng.</p>
  </li>
  <li>
    <p><strong>MyInstanceIDListenerService.java</strong>: khi token thay đổi, sẽ gọi đến nó với phương thức <code class="highlighter-rouge">onTokenRefresh</code>.</p>
  </li>
  <li>
    <p><strong>MyGcmListenerService.java</strong>: lắng nghe các thông tin từ GCM server (không phải server của ta tự xây dựng đâu) với phương thức <code class="highlighter-rouge">onMessageReceived</code>.</p>
  </li>
</ol>

<h5 id="registrationintentservicejava">RegistrationIntentService.java</h5>

<p>Như đã giới thiệu ở trên, class này sẽ tạo một <code class="highlighter-rouge">instance ID</code> từ Google và nó là duy nhất cho thiết bị và ứng dụng của bạn.</p>

<div class="language-java highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nd">@Override</span>
<span class="kd">protected</span> <span class="kt">void</span> <span class="nf">onHandleIntent</span><span class="o">(</span><span class="n">Intent</span> <span class="n">intent</span><span class="o">)</span> <span class="o">{</span>        
    <span class="o">...</span>
    <span class="c1">// [START get token]</span>
    <span class="n">InstanceID</span> <span class="n">instanceID</span> <span class="o">=</span> <span class="n">InstanceID</span><span class="o">.</span><span class="na">getInstance</span><span class="o">(</span><span class="k">this</span><span class="o">);</span>
    <span class="n">String</span> <span class="n">token</span> <span class="o">=</span> <span class="n">instanceID</span><span class="o">.</span><span class="na">getToken</span><span class="o">(</span><span class="n">getString</span><span class="o">(</span><span class="n">R</span><span class="o">.</span><span class="na">string</span><span class="o">.</span><span class="na">gcm_defaultSenderId</span><span class="o">),</span>
                    <span class="n">GoogleCloudMessaging</span><span class="o">.</span><span class="na">INSTANCE_ID_SCOPE</span><span class="o">,</span> <span class="kc">null</span><span class="o">);</span>
    <span class="c1">// [END get_token]</span>
    <span class="n">Log</span><span class="o">.</span><span class="na">i</span><span class="o">(</span><span class="n">TAG</span><span class="o">,</span> <span class="s">"GCM Registration Token: "</span> <span class="o">+</span> <span class="n">token</span><span class="o">);</span>
    <span class="o">...</span>
<span class="o">}</span>
</code></pre></div></div>

<p>Giả sử yêu cầu này là thành công, bạn sẽ có một token. Và khi đó, ta sẽ tiến hành đăng kí token này lên server do chúng ta xây dựng với các tham số như đã xây dựng trong bảng <code class="highlighter-rouge">gcm_users</code> bằng phương thức <code class="highlighter-rouge">sendRegistrationToServer</code>.</p>

<p>Hãy nhớ đăng kí service này trong <strong>AndroidManifest.xml</strong></p>

<div class="language-xml highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nt">&lt;/application&gt;</span>
    ...
    <span class="nt">&lt;service</span>
        <span class="na">android:name=</span><span class="s">".RegistrationIntentService"</span>
        <span class="na">android:exported=</span><span class="s">"false"</span><span class="nt">&gt;</span>
    <span class="nt">&lt;/service&gt;</span>
	...
<span class="nt">&lt;/application&gt;</span>
</code></pre></div></div>

<h5 id="myinstanceidlistenerservicejava">MyInstanceIDListenerService.java</h5>

<p>Theo <a href="https://developers.google.com/instance-id/guides/android-implementation">tài liệu</a> chính thức của Google, <code class="highlighter-rouge">InstanceID</code> sẽ có hạn sử dụng tối đa là 6 tháng. Để khắc phục điều này, ta cần extend từ <code class="highlighter-rouge">InstanceIDListenerService</code> để xử lý những thay đổi khi refresh token. Vì vậy, ta nên tạo  <code class="highlighter-rouge">MyInstanceIDListenerService.java</code> để chạy <code class="highlighter-rouge">RegistrationIntentService</code> - giúp chúng ta lấy được token mới.</p>

<div class="language-java highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="kd">public</span> <span class="kd">class</span> <span class="nc">MyInstanceIDListenerService</span> <span class="kd">extends</span> <span class="n">InstanceIDListenerService</span> <span class="o">{</span>
    <span class="nd">@Override</span>
    <span class="kd">public</span> <span class="kt">void</span> <span class="nf">onTokenRefresh</span><span class="o">()</span> <span class="o">{</span>
        <span class="c1">// Fetch updated Instance ID token and notify of changes</span>
        <span class="n">Intent</span> <span class="n">intent</span> <span class="o">=</span> <span class="k">new</span> <span class="n">Intent</span><span class="o">(</span><span class="k">this</span><span class="o">,</span> <span class="n">RegistrationIntentService</span><span class="o">.</span><span class="na">class</span><span class="o">);</span>
        <span class="n">startService</span><span class="o">(</span><span class="n">intent</span><span class="o">);</span>
    <span class="o">}</span>
<span class="o">}</span>
</code></pre></div></div>

<div class="language-xml highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nt">&lt;/application&gt;</span>
    <span class="c">&lt;!-- [START instanceId_listener] --&gt;</span>
    <span class="nt">&lt;service</span>
        <span class="na">android:name=</span><span class="s">".MyInstanceIDListenerService"</span>
        <span class="na">android:exported=</span><span class="s">"false"</span><span class="nt">&gt;</span>
        <span class="nt">&lt;intent-filter&gt;</span>
            <span class="nt">&lt;action</span> <span class="na">android:name=</span><span class="s">"com.google.android.gms.iid.InstanceID"</span><span class="nt">/&gt;</span>
        <span class="nt">&lt;/intent-filter&gt;</span>
    <span class="nt">&lt;/service&gt;</span>
    <span class="c">&lt;!-- [END instanceId_listener] --&gt;</span>
<span class="nt">&lt;/application&gt;</span>
</code></pre></div></div>

<h5 id="tạo-broadcast-receiver-và-message-handler">Tạo Broadcast Receiver và Message Handler</h5>

<p>Khai báo trong <code class="highlighter-rouge">AndroidManifest.xml</code>:</p>

<div class="language-xml highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nt">&lt;receiver</span>
  <span class="na">android:name=</span><span class="s">"com.google.android.gms.gcm.GcmReceiver"</span>
  <span class="na">android:exported=</span><span class="s">"true"</span>
  <span class="na">android:permission=</span><span class="s">"com.google.android.c2dm.permission.SEND"</span> <span class="nt">&gt;</span>
  <span class="nt">&lt;intent-filter&gt;</span>
     <span class="nt">&lt;action</span> <span class="na">android:name=</span><span class="s">"com.google.android.c2dm.intent.RECEIVE"</span> <span class="nt">/&gt;</span>
     <span class="nt">&lt;category</span> <span class="na">android:name=</span><span class="s">"com.codepath.gcmquickstart"</span> <span class="nt">/&gt;</span>
  <span class="nt">&lt;/intent-filter&gt;</span>
<span class="nt">&lt;/receiver&gt;</span>
</code></pre></div></div>

<h5 id="mygcmlistenerservicejava">MyGcmListenerService.java</h5>

<p>Tạo file <code class="highlighter-rouge">MyGcmListenerService.java</code> được extends từ <code class="highlighter-rouge">GcmListenerService</code> - sẽ xử lý việc nhận các thông báo từ phía GCM server:</p>

<div class="language-java highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="kd">public</span> <span class="kd">class</span> <span class="nc">MyGcmListenerService</span> <span class="kd">extends</span> <span class="n">GcmListenerService</span> <span class="o">{</span>

    <span class="kd">private</span> <span class="kd">static</span> <span class="kd">final</span> <span class="n">String</span> <span class="n">TAG</span> <span class="o">=</span> <span class="s">"MyGcmListenerService"</span><span class="o">;</span>

    <span class="c1">// [START receive_message]</span>
    <span class="nd">@Override</span>
    <span class="kd">public</span> <span class="kt">void</span> <span class="nf">onMessageReceived</span><span class="o">(</span><span class="n">String</span> <span class="n">from</span><span class="o">,</span> <span class="n">Bundle</span> <span class="n">data</span><span class="o">)</span> <span class="o">{</span>
        <span class="n">String</span> <span class="n">message</span> <span class="o">=</span> <span class="n">data</span><span class="o">.</span><span class="na">getString</span><span class="o">(</span><span class="s">"message"</span><span class="o">);</span>
        <span class="n">Log</span><span class="o">.</span><span class="na">d</span><span class="o">(</span><span class="n">TAG</span><span class="o">,</span> <span class="s">"From: "</span> <span class="o">+</span> <span class="n">from</span><span class="o">);</span>
        <span class="n">Log</span><span class="o">.</span><span class="na">d</span><span class="o">(</span><span class="n">TAG</span><span class="o">,</span> <span class="s">"Message: "</span> <span class="o">+</span> <span class="n">message</span><span class="o">);</span>
       
        <span class="n">sendNotification</span><span class="o">(</span><span class="n">message</span><span class="o">);</span>
        <span class="c1">// [END_EXCLUDE]</span>
    <span class="o">}</span>
    <span class="c1">// [END receive_message]</span>

    <span class="kd">private</span> <span class="kt">void</span> <span class="nf">sendNotification</span><span class="o">(</span><span class="n">String</span> <span class="n">message</span><span class="o">)</span> <span class="o">{</span>
        <span class="n">Intent</span> <span class="n">intent</span> <span class="o">=</span> <span class="k">new</span> <span class="n">Intent</span><span class="o">(</span><span class="k">this</span><span class="o">,</span> <span class="n">MainActivity</span><span class="o">.</span><span class="na">class</span><span class="o">);</span>
        <span class="n">intent</span><span class="o">.</span><span class="na">addFlags</span><span class="o">(</span><span class="n">Intent</span><span class="o">.</span><span class="na">FLAG_ACTIVITY_CLEAR_TOP</span><span class="o">);</span>
        <span class="n">PendingIntent</span> <span class="n">pendingIntent</span> <span class="o">=</span> <span class="n">PendingIntent</span><span class="o">.</span><span class="na">getActivity</span><span class="o">(</span><span class="k">this</span><span class="o">,</span> <span class="mi">0</span><span class="o">,</span> <span class="n">intent</span><span class="o">,</span>
                <span class="n">PendingIntent</span><span class="o">.</span><span class="na">FLAG_ONE_SHOT</span><span class="o">);</span>

        <span class="n">Uri</span> <span class="n">defaultSoundUri</span> <span class="o">=</span> <span class="n">RingtoneManager</span><span class="o">.</span><span class="na">getDefaultUri</span><span class="o">(</span><span class="n">RingtoneManager</span><span class="o">.</span><span class="na">TYPE_NOTIFICATION</span><span class="o">);</span>
        <span class="n">NotificationCompat</span><span class="o">.</span><span class="na">Builder</span> <span class="n">notificationBuilder</span> <span class="o">=</span> <span class="k">new</span> <span class="n">NotificationCompat</span><span class="o">.</span><span class="na">Builder</span><span class="o">(</span><span class="k">this</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setSmallIcon</span><span class="o">(</span><span class="n">R</span><span class="o">.</span><span class="na">mipmap</span><span class="o">.</span><span class="na">ic_launcher</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setContentTitle</span><span class="o">(</span><span class="s">"GCM Message"</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setContentText</span><span class="o">(</span><span class="n">message</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setAutoCancel</span><span class="o">(</span><span class="kc">true</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setSound</span><span class="o">(</span><span class="n">defaultSoundUri</span><span class="o">)</span>
                <span class="o">.</span><span class="na">setContentIntent</span><span class="o">(</span><span class="n">pendingIntent</span><span class="o">);</span>

        <span class="n">NotificationManager</span> <span class="n">notificationManager</span> <span class="o">=</span>
                <span class="o">(</span><span class="n">NotificationManager</span><span class="o">)</span> <span class="n">getSystemService</span><span class="o">(</span><span class="n">Context</span><span class="o">.</span><span class="na">NOTIFICATION_SERVICE</span><span class="o">);</span>

        <span class="n">notificationManager</span><span class="o">.</span><span class="na">notify</span><span class="o">(</span><span class="mi">0</span> <span class="cm">/* ID of notification */</span><span class="o">,</span> <span class="n">notificationBuilder</span><span class="o">.</span><span class="na">build</span><span class="o">());</span>
    <span class="o">}</span>
<span class="o">}</span>
</code></pre></div></div>

<p>Và không thể thiếu phần đăng kí service cho class</p>

<div class="language-xml highlighter-rouge"><div class="highlight"><pre class="highlight"><code><span class="nt">&lt;service</span>
<span class="na">android:name=</span><span class="s">".MyGcmListenerService"</span>
<span class="na">android:exported=</span><span class="s">"false"</span> <span class="nt">&gt;</span>
    <span class="nt">&lt;intent-filter&gt;</span>
        <span class="nt">&lt;action</span> <span class="na">android:name=</span><span class="s">"com.google.android.c2dm.intent.RECEIVE"</span> <span class="nt">/&gt;</span>
    <span class="nt">&lt;/intent-filter&gt;</span>
<span class="nt">&lt;/service&gt;</span>
</code></pre></div></div>

<h5 id="mainactivityjava">MainActivity.java</h5>

<script src="https://gist.github.com/hungdh0x5e/fe285dbcdf6bc9bd8335.js"></script>

<h4 id="4-demo">4. Demo</h4>

<p>Truy cập vào giao diện quản lý của server. Viết nội dung và gửi thông báo cho client.</p>

<p><img src="/assets/images/2016/01/gcm-demo-1.PNG" alt="Screenshot" /></p>

<p>Source code bạn có thể tham khảo <a href="https://github.com/hungdh0x5e/GoogleCloudMessaging">tại đây</a>.</p>

