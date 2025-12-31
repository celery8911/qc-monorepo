# 📦 发包流程完整指南

## 🎯 工作流程概览

```
开发 → Changeset → 版本升级 → 发布
```

---

## 🔄 完整发布流程

### 方式一：手动发布（本地）

#### 1. 开发功能并创建 Changeset
```bash
# 修改代码...
git add .
git commit -m "feat: 添加新功能"

# 创建 changeset（交互式）
pnpm changeset
# 选择要发布的包
# 选择版本类型（patch/minor/major）
# 输入变更描述

# 提交 changeset
git add .changeset/
git commit -m "docs: add changeset"
git push
```

#### 2. 升级版本
```bash
# 应用 changeset，更新版本号和 CHANGELOG
pnpm version-packages

# 查看变更
git diff

# 提交版本变更
git add .
git commit -m "chore: version packages"
```

#### 3. 构建和发布
```bash
# 构建所有包
pnpm build

# 发布到 npm（或私仓）
pnpm release

# 推送 tag
git push --follow-tags
```

---

### 方式二：自动发布（CI）

#### 设置步骤

1. **配置 NPM Token**
   ```bash
   # 1. 登录 npm
   npm login

   # 2. 创建 token（需要在 npm 网站操作）
   # https://www.npmjs.com/settings/{username}/tokens
   # 选择: Automation token

   # 3. 在 GitHub 仓库添加 Secret
   # Settings > Secrets and variables > Actions
   # 添加: NPM_TOKEN = 你的 token
   ```

2. **发布流程**
   ```bash
   # 1. 创建 changeset（本地）
   pnpm changeset
   git add .changeset/
   git commit -m "docs: add changeset"
   git push

   # 2. GitHub Actions 自动创建 "Version Packages" PR

   # 3. 合并 PR 后，自动发布到 npm
   ```

---

## 📊 版本号规则

### Semantic Versioning (语义化版本)

```
major.minor.patch
  |     |     |
  |     |     └─ 修复 bug（向后兼容）
  |     └─────── 新功能（向后兼容）
  └───────────── 破坏性更新（不向后兼容）
```

### 示例

```bash
# patch: 1.0.0 → 1.0.1
- 修复 bug
- 优化性能
- 更新文档

# minor: 1.0.0 → 1.1.0
- 添加新功能
- 添加新 API
- 废弃旧 API（但保留）

# major: 1.0.0 → 2.0.0
- 删除旧 API
- 改变 API 行为
- 重构架构
```

---

## 🤖 CI/CD 工作流详解

### CI 流程（ci.yml）

```yaml
触发时机:
  - Pull Request → main
  - Push → main

执行步骤:
  1. ✅ 检出代码
  2. ✅ 安装依赖
  3. ✅ 运行构建
  4. ✅ 运行测试

作用: 确保代码质量，防止破坏性变更
```

### Release 流程（release.yml）

```yaml
触发时机:
  - Push → main

执行逻辑:
  如果有 changeset:
    → 创建 "Version Packages" PR
    → PR 包含版本升级 + CHANGELOG

  如果 Version PR 被合并:
    → 自动构建
    → 自动发布到 npm
    → 自动创建 GitHub Release

作用: 全自动版本管理和发布
```

---

## 💡 常见场景

### 场景1: 修复 bug

```bash
# 1. 修复代码
# 2. 创建 changeset
pnpm changeset
# 选择: patch
# 描述: "修复了 xxx bug"

# 3. 提交
git add .
git commit -m "fix: 修复 xxx bug"
git push
```

### 场景2: 添加新功能

```bash
# 1. 开发新功能
# 2. 创建 changeset
pnpm changeset
# 选择: minor
# 描述: "添加了 xxx 功能"

# 3. 提交
git add .
git commit -m "feat: 添加 xxx 功能"
git push
```

### 场景3: 破坏性更新

```bash
# 1. 重构代码
# 2. 创建 changeset
pnpm changeset
# 选择: major
# 描述: "重构了 xxx，删除了 yyy API"

# 3. 提交
git add .
git commit -m "feat!: 重构 xxx"
git push
```

### 场景4: 多个包同时更新

```bash
# 创建 changeset 时选择多个包
pnpm changeset
# 空格选择多个包
# 可以为每个包选择不同的版本类型
```

---

## 🔧 私仓配置

### 如果发布到私有 npm 仓库

1. **配置 .npmrc**
   ```bash
   # 项目根目录
   echo "registry=https://your-private-registry.com" > .npmrc
   ```

2. **配置认证**
   ```bash
   # 添加认证 token
   npm config set //your-private-registry.com/:_authToken YOUR_TOKEN
   ```

3. **GitHub Actions 配置**
   ```yaml
   # .github/workflows/release.yml
   - name: Setup .npmrc
     run: |
       echo "registry=https://your-private-registry.com" > .npmrc
       echo "//your-private-registry.com/:_authToken=${NPM_TOKEN}" >> .npmrc
   ```

---

## 📝 最佳实践

### 1. Commit 规范

```bash
feat:     新功能
fix:      修复 bug
docs:     文档更新
style:    代码格式
refactor: 重构
test:     测试相关
chore:    构建/工具相关
```

### 2. Changeset 描述

```markdown
❌ 不好: "update code"
✅ 好的: "修复了登录失败的问题"

❌ 不好: "fix"
✅ 好的: "优化了构建性能，减少 50% 构建时间"
```

### 3. 发布前检查

```bash
# 1. 确保所有测试通过
pnpm test

# 2. 确保构建成功
pnpm build

# 3. 检查版本号是否正确
cat packages/*/package.json | grep version

# 4. 查看 CHANGELOG
cat packages/*/CHANGELOG.md
```

---

## 🚨 常见问题

### Q: 如何撤销一个 changeset?
```bash
# 删除 .changeset 目录下的对应文件即可
rm .changeset/某个-changeset.md
```

### Q: 如何跳过 CI 发布?
```bash
# commit 信息中加入 [skip ci]
git commit -m "docs: update README [skip ci]"
```

### Q: 发布失败怎么办?
```bash
# 1. 查看 GitHub Actions 日志
# 2. 检查 NPM_TOKEN 是否正确
# 3. 检查包名是否可用
# 4. 手动发布：pnpm release
```

### Q: 如何发布 beta 版本?
```bash
# 1. 创建 changeset 时使用 prerelease
pnpm changeset --pre beta

# 2. 或手动修改版本号
npm version 2.0.0-beta.1
```

---

## 🎓 学习资源

- [Changesets 官方文档](https://github.com/changesets/changesets)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [GitHub Actions 文档](https://docs.github.com/cn/actions)
- [Turborepo 文档](https://turbo.build/repo/docs)
