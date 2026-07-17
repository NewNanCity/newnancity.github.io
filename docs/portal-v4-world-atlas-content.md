# 玩家门户 V4：世界图鉴与内容接入

## Outcome

世界页第一屏成为可直接进入六座城镇的 2.5D 图鉴；全站顶栏提供一个可搜索、可键盘操作的旅行面板；首页动态区从固定队列升级为“内容目录 + 首页引用”，为后续审核通过的城镇或玩家页面保留稳定接入契约。三项能力都复用现有事实源，不增加首页长度、不伪造地理数据，也不引入后端或 WebGL。

## Context And Assumptions

- V3 已建立 `gateways`、`quickActions`、`townDirectory`、`feed` 和生态入口，但同一目标分散在不同场景中，顶栏的全局查找仍是静态菜单。
- `portal.feed` 当前既承担内容目录又承担首页展示队列，并被 5 至 8 条上限锁住；未来页面增加内容时会迫使首页一起增长。
- 仓库没有当前全局底图、站点坐标、线路折线、统一比例尺或完整行政边界。实时地图是精确空间事实源，历史地图不能拼成当前地图。
- `/pic/NSrank_KXChengqu.webp` 是可确认的真实牛腩场景，可承担图鉴舞台；城镇节点的位置只表达编辑层次，不表达地理比例或线路关系。
- 玩家页面接入在本轮只代表“审核后的页面来源可以被内容目录引用”。不代表允许任意玩家脚本在 `newnan.city` 同源执行。

## Product Decisions

1. 世界页用专用 `WorldAtlas` 替代通用页面 Hero 与重复的六项目录；节点本身仍是普通链接，精确地图、城镇评级和完整名册保持直接入口。
2. 图鉴布局固定为 `editorial`，只使用场景景深、透视网格和独立节点，不绘制未经证实的道路、线路或行政边界。
3. 顶栏的旅行按钮替代桌面 `•••` 菜单和移动抽屉中的重复工具列表。一级导航、Hero 快捷入口和页面内场景入口继续保留。
4. 旅行目标不写入 JSON，而是从 `gateways`、`townDirectory`、`nav.links` 和已登记内容来源派生并按规范化 URL 去重。
5. `portal.feed` 保留原键并扩展为内容目录；`homeFeedIds` 决定首页展示的 5 至 8 项。V3 数据没有该字段时继续使用全部旧 `feed`。
6. 真 3D、视频和实时状态不进入本轮。图鉴只用 DOM、CSS perspective 和合成层 transform。

## Information Architecture

```text
顶栏
├─ 四个一级入口
├─ 旅行按钮
│  ├─ 门户
│  ├─ 城镇
│  ├─ 工具与站外服务
│  └─ 已登记页面来源
└─ 移动菜单（仅一级入口）

世界页
├─ 2.5D 城镇图鉴（六个直达节点）
├─ 三个富城镇故事
└─ 精确地图 / 评级 / 完整名册入口

首页动态区
└─ portal.feed 内容目录
   └─ homeFeedIds 选择并排序首页条目
```

## Additive Data Contract

以下字段都对 V3 可选；本仓库的 V4 源数据必须完整提供：

```ts
interface PortalContentSource {
  id: string
  kind: 'official' | 'player'
  name: string
  description: string
  href: string
  status: 'open' | 'preparing'
}

interface PortalFeedItem {
  // V3 字段保持不变
  sourceRef?: `town:${string}` | `page:${string}`
  publishedOn?: string
}

interface PortalWorldAtlasNode {
  targetRef: `town:${string}`
  x: number       // 0..100，仅为编辑布局
  y: number       // 0..100，仅为编辑布局
  depth: number   // 0..1，控制视觉层次
}

interface PortalWorldAtlas {
  layout: 'editorial'
  backgroundImage: string
  nodes: PortalWorldAtlasNode[]
}
```

`portal` 增加 `contentSources?`、`homeFeedIds?` 和 `worldAtlas?`。城镇来源通过 `town:<id>` 引用 `townDirectory`，页面来源通过 `page:<id>` 引用 `contentSources`；名称、状态和 URL 不在 feed 或 atlas 节点中复制。

## Validation And Compatibility

- `homeFeedIds` 存在时必须包含 5 至 8 个唯一且可解析的 feed ID；此时内容目录可大于 8 条。缺失时继续要求旧 feed 为 5 至 8 条。
- `sourceRef` 必须解析到开放城镇或开放页面；筹备中的来源不能发布首页内容。
- `publishedOn` 只在有事实日期时提供，并校验真实 `YYYY-MM-DD`。
- 图鉴节点必须唯一引用现有城镇；坐标为有限范围值，背景只能使用受控的 `/pic/` 或 `/towns/` 图片。
- 新脚本遇到 V3 JSON 时隐藏图鉴和来源元数据，继续显示原世界页、原城镇目录和完整旧 feed，不硬编码缺失数据。
- `nav.links` 与 `gateways` 在进入全局旅行面板前统一执行安全 URL 校验。

## Interaction And Accessibility

- 旅行面板使用原生 `<dialog>` 与 `showModal()`：打开后页面其余部分 inert，焦点进入搜索框；Escape、关闭按钮和背景点击可关闭，随后焦点回到旅行按钮。
- 搜索只做空白归一化、大小写无关的子串匹配，不新增模糊搜索依赖、历史记录、收藏或埋点。
- 城镇图鉴节点是链接；hover 和 focus 只改变当前预览与轻微深度，不增加“先选中再进入”的第二步。
- 2.5D 视差只在细指针且未启用 reduced motion 时运行；移动端使用平面节点布局，所有目标仍保持至少 44px 点击区。
- 方案遵循 [W3C Modal Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) 与 [MDN `showModal()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal) 的焦点和 inert 行为，并按 [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-motion) 关闭非必要运动。

## Performance Budget

- 不新增 npm 依赖，不创建 canvas，不加载实时地图 iframe，不下载视频。
- 图鉴背景继续进入现有图片哈希、压缩、尺寸和存在性检查；首屏只加载一个背景，富城镇封面保持懒加载。
- 指针移动只更新 CSS 变量与 transform；不逐帧读取布局，不在粗指针或后台页面运行。
- 相对 V3，主 JS gzip 增量不超过 8 KiB，CSS gzip 增量不超过 4 KiB；超过则停止并重新评估拆分。

## Acceptance Criteria

- 桌面第一屏可看见牛腩世界名称、实时地图入口和六个城镇节点；节点 hover、focus 与点击均正确。
- 390×844 下图鉴退回清晰平面布局，无横向溢出、文字裁切或细小点击目标。
- 旅行面板能搜索中文城镇、英文站点与工具；结果不重复，外链安全，新旧路由保持不变。
- 桌面 Tab 可进入旅行按钮，面板内焦点不逃逸；Escape 关闭并恢复焦点；移动菜单与旅行面板不会同时打开。
- 首页只渲染 `homeFeedIds` 指定条目；来源与真实日期可见，V3 拦截数据仍能正常降级。
- reduced motion 与粗指针下没有场景平移；console、page error、失败主站请求、损坏图片和横向溢出均为零。
- `pnpm test`、`pnpm exec tsc -b`、`pnpm run build` 和 `git diff --check` 通过。

## Non-goals And Stop Rules

- 不把图鉴称为地图，不从历史截图或文案推算当前坐标，不抓取实时地图内部接口。
- 不接入服务器状态、在线玩家、天气或注册 API，不增加玩家脚本托管权限。
- 不实现收藏、最近访问、个性化排序、全文索引、真 3D、视频或音效。
- 若必须新增依赖、改变现有 URL、让 V3 数据白屏、加载实时地图数据，或主包超过性能预算，则停止并请求确认。
