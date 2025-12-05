# ChefOS Portal

ChefOS 的公开门户网站，面向最终用户提供菜谱浏览、搜索和详情查看功能。

## 🛠️ 技术栈 (Tech Stack)

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**:
  - [Framer Motion](https://www.framer.com/motion/): 复杂的组件级动画（入场、交错、手势）。
  - [Lenis](https://lenis.studio/): 平滑滚动 (Smooth Scrolling)，提供类似原生应用的滚动阻尼感。
- **Data Fetching**: Server Components + Fetch API (ISR/SSG).

## 🚀 快速开始 (Getting Started)

### 1. 环境配置

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

确保 `.env.local` 中包含后端 API 地址：

```env
API_URL=http://localhost:3000
```

### 2. 启动开发服务器

在根目录运行：

```bash
# 启动所有应用
turbo dev

# 或者仅启动 Portal
pnpm --filter @chefos/portal dev
```

访问 [http://localhost:3001](http://localhost:3001) 查看效果。

## 📂 目录结构

```text
src/
├── app/              # App Router 页面路由
│   ├── page.tsx      # 首页
│   ├── layout.tsx    # 全局布局 (Header/Footer/Lenis)
│   └── recipe/[id]/  # 菜谱详情页 (动态路由)
├── components/       # UI 组件
│   ├── MotionWrapper.tsx # 动画封装 (FadeIn, Stagger)
│   ├── SmoothScrollProvider.tsx # Lenis 滚动封装
│   └── ...
└── lib/              # 工具函数
```

## 🎨 动画系统

本项目封装了一套统一的动画组件，位于 `src/components/MotionWrapper.tsx`：

- **`<FadeIn>`**: 元素进入视口时淡入位移。
- **`<StaggerContainer>` & `<StaggerItem>`**: 用于列表项的交错显示效果。

使用示例：

```tsx
<StaggerContainer>
  {items.map((item) => (
    <StaggerItem key={item.id}>
      <Card item={item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```
