# 项目 TODO

## 外部入口可用性

- [ ] `wiki.newnan.city` 于 2026-07-17 在真实浏览器中出现 `ERR_CONNECTION_CLOSED` / 超时；主站上线快捷入口前需由 Wiki 服务负责人恢复并复验。

## 现有技术债务

- [ ] 为筹备页 `towns/chenchun/index.html` 和通用 `towns/comingsoon.html` 增加 `noindex`，避免未完成内容进入搜索索引。
- [ ] 修复 Windows 本地构建时 `vite-plugin-compression` 把预压缩文件写入 `dist/D:/...` 的路径问题；Linux GitHub Actions 的正式发布路径需保持不变。

2026-07-17 至 2026-07-21 完成的官网质量改造、玩家门户 V1-V4、桃花源官网内容与长文导航更新已归档到 `docs/releases/unreleased/`；发布状态以对应 GitHub Actions 运行和正式域名核验为准。
