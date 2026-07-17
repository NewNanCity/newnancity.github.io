# 玩家门户 V3：入口与动态层次

## Outcome

首页第一屏直接提供地图、皮肤站和小镇目录三个高频入口；世界页集中承接仓库内全部可发布城镇站，并继续引导到 Wolai 完整名册。视觉上增加来自真实城镇画面的空间感和细节动效，但不增加首页 section、不引入重型运行时或牺牲移动端稳定性。

## Context

- V2 首页已有 Hero、动态播报、四个一级入口、生态入口和社区口号，结构不应重新膨胀为长瀑布。
- `portal.towns` 只维护凯夏镇、桃花源、天元镇三个富城镇名片；仓库实际还发布云梦泽、未央和晨春三个独立站。
- Wolai 公开名册约 30 条，但缺少稳定 slug、摘要、封面和受控同步契约，仍作为外部完整事实源。
- 地图和皮肤站是玩家高频操作，当前分别藏在一级页面或首页后段，第一屏没有直接入口。
- 当前首屏已有真实 Minecraft 城镇全景，适合做轻量相机视差；仓库没有可用于正式发布的视频或 3D 场景资产。

## Product Decisions

1. 首页不新增独立区块。三个高频动作进入 Hero 的快捷启动栏，加入流程继续保留为主按钮。
2. “城镇目录”分成两层：世界页展示 6 个本站可直接到达的城镇站；Wolai 继续承载更广的 30 条完整名册。
3. 三个富城镇名片继续承担故事、标签和二次进入独立站的职责，不强迫资料不足的城镇套用同一模板。
4. 本轮用现有 Hero 图片做最大约 10px 的 2.5D 指针视差，并为快捷入口和目录行补充短促状态变化。粗指针、页面失焦和减少动态效果设置下不运行持续动效。
5. 不在没有正式素材和性能预算的情况下加入 Three.js 或自动播放视频。

## Information Architecture

```text
首页第一屏
├─ 加入牛腩（主动作）
└─ 快捷启动
   ├─ 实时地图
   ├─ 皮肤站
   └─ 小镇目录

世界页
├─ 6 个本站城镇入口
│  ├─ 云梦泽
│  ├─ 未央
│  ├─ 凯夏镇
│  ├─ 桃花源
│  ├─ 天元镇
│  └─ 晨春（明确标记页面筹备中）
├─ 3 个富城镇名片
└─ Wolai 完整名册 / 实时地图 / 城镇评级
```

## Content Contract

`site-data.json` 对 `portal` 做向后兼容的加法扩展：

- `quickActions`：固定包含 `map`、`skin`、`towns`，提供短标签、图标和 URL。
- `townDirectory`：本站可发布城镇站目录，包含稳定 ID、名称、摘要、元信息、URL 和 `open | preparing` 状态。

源数据必须提供完整的三项 `quickActions` 和六项 `townDirectory`。考虑到 CDN 可能短暂返回 V2 JSON，运行时在字段完全缺失时保持旧页面可用：隐藏新增快捷栏或本地目录，继续展示既有 Hero 与富城镇名片；一旦字段存在，便执行严格的非空、固定目标和本地 `/towns/...` 路径校验。组件不通过硬编码或目录名猜测缺失的数据。

现有 `ecosystem`、`towns`、`spotlight` 和 `updates` 保留，不更改既有字段语义。

## Motion And Performance Budget

- 不新增运行时依赖，不创建 WebGL canvas，不下载视频。
- Hero 只修改合成层 `transform`，不在指针移动期间触发布局测量循环。
- 视差仅在 `(pointer: fine)` 且未启用 `prefers-reduced-motion` 时生效；离开 Hero 或条件变化后回到静止状态。
- 所有入口在无动画、图片未加载或 JavaScript 刚完成挂载时仍然可见可用。
- 生产构建的主入口 gzip 体积不得因本轮出现明显级别增长；若新交互需要重型依赖则停止实现。

## 3D / Video Decision Gate

真 3D 只有在提供明确场景主题、交互目标、移动端降级和独立懒加载预算后才进入 POC；正式实现必须使用 Three.js，并验证 canvas 非空、构图、移动端和 reduced motion。视频方案需要真实游戏录屏、WebM/MP4 双格式、静态 poster、无声策略和移动网络预算。当前两者都缺少素材与可验证收益，因此不进入生产代码。

本轮 2.5D 视差只验证“真实场景具有空间层次时，首屏是否更有游戏感”，不证明真 3D 或视频值得长期维护。

### 2026-07-18 调研结论

- Three.js 仍在持续维护，但真 3D 不只是增加一个依赖。官方响应式指南明确说明高 DPI 绘制缓冲会显著放大像素工作量，需要主动限制分辨率并验证移动 GPU；参见 [Three.js Responsive Design](https://threejs.org/manual/en/responsive.html) 与 [npm 包状态](https://www.npmjs.com/package/three)。
- 视频自动播放受浏览器策略约束，正式方案必须以静音、poster、用户控制和失败回退为前提；参见 [MDN Autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)。
- 所有非必要运动都必须服从系统的减少动态效果偏好；参见 [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion)。

因此本轮没有用程序化 3D 或占位视频制造“技术感”。下一次进入 POC 前，至少要先有一段可代表牛腩世界的正式场景素材、一个只能由 3D/视频完成的交互目标，以及独立的移动端性能预算。

## Acceptance Criteria

- 1440x900 与 390x844 第一屏都能直接到达地图、皮肤站和小镇目录，文字不裁切、交互不重叠。
- 世界页可从统一目录到达 6 个本地城镇站；晨春状态明确，Wolai 完整名册仍可见。
- 地图旧地址、三个富城镇路由、独立城镇 URL 和外部皮肤站地址保持兼容。
- 指针视差幅度受限，离开后复位；粗指针和 reduced motion 下无视差与非必要过渡。
- 键盘焦点清晰，整个可点击入口只有一个交互目标，外部链接使用安全的窗口关系。
- 桌面与移动端无横向溢出、损坏图片、console error 或失败的主站请求。
- `pnpm test`、`pnpm run build`、`git diff --check` 通过。

## Integration Notes

- 只修改主站数据契约、Hero、世界页及对应样式和测试；不改城镇站正文、地图服务、外部网站或部署工作流。
- 目录数据来自现有可发布页面，不把目录扫描结果直接暴露为 UI 文案。
- `portal.towns` 仍是富档案事实源；`townDirectory` 不替代它，也不为资料不足的页面伪造 facts。
- V2 首页预算继续有效：高频入口通过重排进入首屏，而不是新增首页内容带。

## Stop Rules

- 需要引入 Three.js、视频播放器、第三方运行时、真实 3D 素材或修改构建拆包策略时停止并确认。
- 需要抓取 Wolai 未文档化接口、修改外部站点、改变现有 URL 或发布生产环境时停止并确认。
- 快捷启动栏导致 390px 首屏无法同时容纳品牌、关键统计和主动作时，优先收敛文案与尺寸，不继续增加入口。
- 同一布局或交互问题连续三次验证失败时停止并报告证据。
