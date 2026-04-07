# floating-ball-publish

发布 @beforegolive/floating-ball 包的完整流程。

## 流程
1. 检查 npm 上已发布的最新版本
2. 检查本地 package.json 版本
3. 比较版本：
   - 如果本地版本 > npm 版本（版本已升级但未发布），直接使用当前版本发布
   - 如果版本相同，检查代码是否有未提交的变动
     - 如有变动：提交 commit，升级 patch 版本，重新构建发布
     - 如无变动：仅构建发布
4. 构建（npm run build）
5. 发布到 npm（npm publish）
6. 推送到远端（git push）

## 版本冲突处理
如果遇到 `E403 You cannot publish over the previously published versions` 错误：
- 说明该版本已在 npm 上存在（可能因 rate-limit 实际已发布）
- 验证：`npm view @beforegolive/floating-ball versions --json`
- 确认已发布后，继续推送 git 即可

## 使用
```
/floating-ball-publish
```

## 注意事项
- 需要在 floating-ball 项目目录下执行
- npm 已配置 registry 和 authToken
