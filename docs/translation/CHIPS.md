# [译]Cookies Having Independent Partitioned State (CHIPS)


> [原文链接-点这里](https://developer.chrome.com/docs/privacy-sandbox/chips/)

> [提案详情-点这里](https://github.com/WICG/CHIPS)

> 图片均来自原文截图，若有侵权请联系**c1094282069@gmail.com**。 Pictures are from the original screenshots, if there is infringement, please contact **c1094282069@gmail.com**

## 什么是 CHIPS ？

拥有独立分区状态的Cookies （CHIPS）是一个隐私沙箱提案，它允许开发人员选择 cookie 加入到 “分区” 存储中，在每个顶层站点(Top-level site)有一个单独的 cookie jar。

分区的第三方cookie 目前只能关联到最初设置的顶级站点，无法从其他任何地方访问。目的是允许第三方服务设置cookie，但是仅能在他们最初设置的顶级站点中读取。

目前该项试验将持续 100 - 102 这几个版本，[原文链接](https://developer.chrome.com/origintrials/#/view_trial/1239615797433729025)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cec1fa0a7b4c4780945bf6c9a30291b8~tplv-k3u1fbpfcp-zoom-1.image)

现在chrome版本大于100 就已经默认开启了，若想关闭的话 在地址栏中输入 : `chrome://flags/#partitioned-cookies`，勾选为关闭即可

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ecf8f9ff1cd2412982b33ca4673108d3~tplv-k3u1fbpfcp-zoom-1.image)

**对前端调试影响：当我们尝试连接一个生产环境，并设置cookie的domain时，会导致无法修改该cookie**

## 我们为什么需要它

当前，第三方 cookies 可以使服务跟踪用户在许多其他不相关的顶级站点中加入它们的信息。这就是跨站点跟踪（ cross-site tracking）。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4fbbb8b4e7d74b6f9761ce5c5f362627~tplv-k3u1fbpfcp-zoom-1.image)

例如，当用户访问站点A，来自站点C的嵌入式内容会设置 cookie 在 用户的机器上用来响应跨站点请求。如果用户访问了站点B(站点B也嵌入了站点C)，那么站点C就可以访问之前用户访问站点A设置的 cookie。这样站点C设置的cookie 可以在站点A、B或者其他嵌入了C站点的站点之间活动。

为了保护用户隐私，浏览器厂商应该限制这种行为，并逐步取消对第三方 cookie 的支持。

虽然跨站点跟踪是一个 issue，目前 web 上存在有效的跨站点跟踪的需求，可以通过 cookie 分区的以保护隐私的方式实现。

## 用例

例如，站点 `retail.example`，可能使用第三方服务 `support.chat.example` 在其站点上嵌入一个聊天框。现在有许多嵌入式聊天服务依赖cookies来保存交互历史记录。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3f53f945ad3e459ab0f2770313e38183~tplv-k3u1fbpfcp-zoom-1.image)

如果没有设置跨站点cookie的能力， `support.chart.example` 可以依赖于 `retail.example` 传递给他们的第一方会话标识符(其他一些派生值)。在这种情况下，每个嵌入 `support.chat.example` 的网站都要额外的设置来传递状态。

或者， `support.chat.example` 可能会请求 `retail.example` ，将包含在 `support.chat.example` 上的JavaScript 嵌入 `retail.example` 页面。这样会带来安全风险，因为它允许 `support.chat.example` 脚本在`retail.example` 上有更高的特权，比如说访问 cookies。

CHIPS 的示例用例包括任何场景，其中跨站点子资源需要会话或持久状态的某些概念，这些概念的范围限于单个顶级站点上用户的活动，例如:

1.  第三方聊天嵌入
1.  第三方地图嵌入
1.  子资源CDN负载均衡
1.  无头CMS供应商
1.  Sandbox domains for serving untrusted user content
1.  第三方CDN私用cookies 提供访问权限
1.  依赖API的前端框架请求时使用cookie

## 它是如何工作的？

CHIPS引入了一个新的 cookie 属性， `Partitioned`，支持顶级上下文分区的跨站点cookie。

根据这个提案，当用户访问站点A并嵌入内容来自站点C时，设置一个带有 `Partitioned` 属性的cookie，这个cookie 被存到了 `partitioned jar`，该 `partitioned jar` 只用于存储站点C嵌入站点A时 设置的cookie。浏览器只会在顶级站点A时发送cookie

当用户访问一个新站点时，嵌入的C将不会收到站点C嵌入站点A时设置的cookie。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/438ce7af2d8b40d9b1b3bb20202ca582~tplv-k3u1fbpfcp-zoom-1.image)

如果用户访问站点C是一个顶级网站，站点C嵌入站点A时设置的 分区 cookie不会携带请求中。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8c90bae248e04d64bb2d4cc7eba4dfd2~tplv-k3u1fbpfcp-zoom-1.image)

## 为什么选择 cookie 分区很重要

随着浏览器逐渐淘汰不分区的第三方cookie，已经尝试了几种不同的分区方法。

Firefox 宣布他们默认采用 ETP Strict 模式 和 隐私浏览模式来对[所有第三方cookie分区](https://hacks.mozilla.org/2021/02/introducing-state-partitioning/)，因此跨站点cookie被顶级站点分区。然而，分区cookie 在没有第三方加入的情况下可能会导致一些bug，因为一些第三方服务已经构建了服务器，期望能够得到未分区的第三方 cookie。

[Safari 以前尝试了基于`heuristics`的分区cookie](https://webkit.org/blog/8613/intelligent-tracking-prevention-2-1/), 但是最终选择完全否掉他们, 原因是开发人员感到困惑。 最近， [Safari expressed interest in an opt-in based model](https://github.com/privacycg/storage-access/issues/75)。

CHIPS与现有的分区cookie不同在于第三方选择加入。cookie必须设置新的属性，以便(未分区的)第三方cookie被淘汰后再跨预防请求上发送。

虽然第三方cookie仍然存在，但是 `Partitioned` 属性提供了更严格、更安全的cookie行为选择。CHIPS是帮助服务平稳过度到没有第三方cookies的一个重要步骤。

## CHIPS 设计细节

### 分区模型

现在，cookie是在设置它们的主机名或域，即它们的主机秘钥。

例如，对于来自`https://support.chat.example` 的cookie，它的 host key 为 `(“ support.chat.example”)`。

在CHIPS中，选择分区的 cookie 将会对其 host key 和 partition key 进行 double-keyed。

// ===============

A *cookie's partition key* is the site ([scheme and registrable domain](https://web.dev/same-site-same-origin/#"schemeful-same-site")) of the top-level URL the browser was visiting at the start of the request to the endpoint that set the cookie.

在上面的例子中，`https://retail.example` 站点中嵌入 `https://support.chat.example`，他的顶级URL 是 `https://retail.example`。

这时 partition key 为 `("https", "retail.example")`。

同样，请求的 partition key 是浏览器在请求开始时访问的顶级 URL 的站点。浏览器只能在请求中发送与 cookie 具有相同分区键的分区属性的 cookie。

下面是上面例子中的 cookie 键在 CHIPS 之前和之后的样子。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a400e170789544f5b89a9430d05d48a8~tplv-k3u1fbpfcp-zoom-1.image)

**CHIPS之前**

```
key=("support.chat.example")
```

**CHIPS之后**

```
key={

  ("https", "retail.example"),     

  ("support.chat.example")

}
```

### 安全设计

为鼓励良好的保安实践，CHIPS 建议分区 cookies 必须绑定到主机名(hostname)(而不是可注册的域名)。更进一步，CHIPS 提出 cookie 只能通过**安全协议(https)** 设置和发送。为了确保这一点，分区的 cookie 必须使用`  _ Host-prefix `。

`_ Host-prefix` 要求将 cookie 设置为 `Secure` 和 `Path =/`，并且不允许使用 `Domain` 属性。由于域 cookie 可以在一个分区内的不同第三方子域之间共享，因此不允许它使分区 cookie 尽可能接近原点绑定; 并使 cookie 更接近[同源策略](https://developer.mozilla.org/zh-CN/docs/Web/Security/Same-origin_policy)。

例如：

```
Set-Cookie: __Host-example=34d8g; SameSite=None; Secure; Path=/; Partitioned;
```

## 参与和分享反馈

-   **GitHub**: Read the : 阅读[proposal 建议](https://github.com/WICG/CHIPS), [提出问题，关注讨论](https://github.com/WICG/CHIPS/issues).

<!---->

-   **Developer support 开发人员支持**: Ask questions and join discussions on the : 提出问题，并参与讨论[Privacy Sandbox Developer Support repo ](https://github.com/GoogleChromeLabs/privacy-sandbox-dev-support).
