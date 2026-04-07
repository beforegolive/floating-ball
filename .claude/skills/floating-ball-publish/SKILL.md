# floating-ball-publish

发布 @beforegolive/floating-ball 包的完整流程。

## 流程
1. 检查代码是否有未提交的变动（git status）
2. 如有变动：
   - 提交 commit
   - 升级 patch 版本（npm version patch）
3. 构建（npm run build）
4. 发布到 npm（npm publish）
5. 推送到远端（git push）

## 使用
```
/floating-ball-publish
```

## 注意事项
- 需要在 floating-ball 项目目录下执行
- npm 已配置 registry 和 authToken
