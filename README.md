# ChefOS 实战开发任务清单 (Task Breakdown)

> **使用说明**：本项目采用 Monorepo 架构。任务按里程碑（Milestone）排序，建议按顺序执行。
> 每个里程碑下增加了 **🧠 涉及知识点** 章节，列出了完成该阶段任务需要掌握或补充学习的核心概念。

## 🧭 技术选型与决策 (Tech Stack Analysis)

在开始之前，我们需要明确**为什么**选择这套技术栈。这些选择均基于“行业标准”与“企业级应用场景”，旨在培养架构师视角的决策能力。

| 领域              | 选型                             | 行业地位与入选理由                                                                                                                                                            | 替代方案对比                                                                                       |
| :---------------- | :------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **架构管理**      | **Monorepo (Turborepo + pnpm)**  | **现代基建标准**。解决了多项目（Admin, App, Server）代码共享和依赖管理的痛点。大厂（字节、阿里、Vercel）标配。                                                                | vs Multirepo: 多仓库会导致 `types` 接口定义难以同步，维护成本高。                                  |
| **后端框架**      | **NestJS**                       | **Node.js 领域的 Spring Boot**。提供了严格的模块化和依赖注入（DI）机制，强制规范代码结构，防止项目随着迭代变成“屎山”。                                                        | vs Express/Koa: 它们太灵活，缺乏约束，不适合多人协作的大型复杂业务。                               |
| **数据库**        | **PostgreSQL**                   | **最先进的开源关系型数据库**。对 JSON 数据类型的支持优于 MySQL（适合存储灵活的配方属性），且在复杂查询性能上更优。                                                            | vs MySQL: MySQL 也是好选择，但 PG 在现代全栈开发中更受青睐。                                       |
| **ORM**           | **TypeORM**                      | **经典且底层**。虽然配置稍繁琐，但它基于装饰器（Decorator）的模式与 NestJS 完美契合，且能让你深入理解 SQL 的 Join 和关系映射。                                                | vs Prisma: Prisma 开发体验更好，但封装太深，不利于学习底层数据库原理。                             |
| **前端 (Admin)**  | **Vue 3 + Pinia + Element Plus** | **国内企业级后台霸主**。极其务实的选择，生态成熟，招聘/应用最广。                                                                                                             | vs React: React 也是顶级选择，但考虑到你已有的技术栈，保持前端熟悉能让你更专注于后端和架构的学习。 |
| **前端 (Portal)** | **Next.js (React)**              | **全球 SSR 标准**。虽然后台用了 Vue，但采用“混合技术栈”策略（Vue Admin + React Portal）能让你同时掌握两大主流框架。Next.js 在 SEO 和服务端渲染领域的生态统治力目前强于 Nuxt。 | vs Nuxt: 强迫自己跳出舒适区，掌握 React 的思维方式（函数式编程、Hooks），提升简历竞争力。          |
| **前端 (Mobile)** | **Vue 3 + Vant UI**              | **轻量级移动端方案**。Vant 是 Vue 生态最成熟的移动端组件库。配合 PWA 技术，可以用 Web 技术栈开发接近原生体验的应用（离线访问）。                                              | vs React Native/Flutter: 学习曲线太陡峭。对于“后厨”这种场景，网页版(PWA)足够轻量且易于分发。       |
| **运维 (DevOps)** | **Docker + Kubernetes (K8s)**    | **云原生标准**。虽然对本项目略显“过度设计”，但掌握 K8s 是从“高级开发”迈向“架构师”的必经之路。                                                                                 | vs PM2: PM2 适合简单部署，但无法学习容器编排、服务发现和弹性伸缩等核心架构概念。                   |

---

## 🛠️ 开发工具 (Development Tools)

为了顺利完成本项目，请确保你的开发环境安装了以下工具：

| 工具                     | 用途                                                                                   | 备注                     |
| :----------------------- | :------------------------------------------------------------------------------------- | :----------------------- |
| **Docker Desktop**       | **基础设施容器化**。用于本地运行 PostgreSQL 和 Redis，无需在本机安装繁琐的数据库软件。 | 必须安装并启动。         |
| **DBeaver** (或 Navicat) | **数据库管理**。用于连接 Docker 中的数据库，查看表结构和数据。                         | 免费开源，推荐 DBeaver。 |
| **Node.js** (v16+)       | **运行环境**。NestJS 和前端框架的基础。                                                | 推荐使用 LTS 版本。      |
| **pnpm**                 | **包管理器**。Monorepo 的核心依赖管理工具。                                            | `npm install -g pnpm`    |
| **Git**                  | **版本控制**。                                                                         | 基础中的基础。           |

---

## 🏗️ Milestone 1: 基建与单体仓库初始化 (Infrastructure)

**目标**：跑通前后端协作环境，解决“代码在哪里写”的问题。

### 🧠 涉及知识点 (Knowledge Points)

- **Monorepo (单体仓库)**: 理解 Workspace (工作区) 概念，依赖提升 (Hoisting)，以及为什么大厂（Google, Meta, ByteDance）倾向于使用 Monorepo 管理复杂项目。
- **包管理器 (pnpm)**: 学习 pnpm 的硬链接 (Hard link) 和符号链接 (Symlink) 机制，理解它如何节省磁盘空间并解决 "Phantom Dependencies" (幽灵依赖) 问题。
- **Docker Compose**: 理解 Service, Network, Volume 的概念，如何通过 YAML 文件编排多个容器（DB, Redis, App）。

### 1.1 Monorepo 环境搭建

- [x] **初始化 Turborepo**：使用 `npx create-turbo@latest` 创建项目，包管理器选择 `pnpm`。
- [x] **清理默认代码**：删除默认的 `apps/web` (Next.js) 和 `apps/docs`，保持 `packages/` 目录结构。
- [x] **规划目录结构**：
  ```text
  apps/
    ├── admin/    (Vue 3 + Element Plus -> 管理后台)
    ├── portal/   (Next.js -> 公开菜谱网站)
    └── mobile/   (Vue 3 + Vant -> 后厨移动端)
  packages/
    ├── types/    (共享 TS 类型)
    └── api-client/ (共享 Axios 封装)
  ```
- [x] **配置工作区 (Workspace)**：在 `pnpm-workspace.yaml` 中确认包含 `apps/*` 和 `packages/*`。
- [x] **统一工程规范**：
  - [x] 在根目录配置 `.eslintrc.js` 和 `.prettierrc`。
  - [x] 配置 `.vscode/settings.json` 实现保存自动格式化。
  - [x] (可选) 配置 Husky + Commitlint 拦截不规范提交。

### 1.2 共享库开发 (Shared Packages)

- [x] **创建 `packages/types`**：
  - [x] 初始化 `package.json` (name: `@chefos/types`)。
  - [x] 配置 `tsconfig.json` (生成 `.d.ts` 声明文件)。
  - [x] 创建 `index.ts`，暂时导出一个测试接口 `export interface Ping { message: string }`。
- [x] **创建 `packages/api-client`**：
  - [x] 安装 `axios`。
  - [x] 封装 `AxiosInstance`，配置基础 URL 和 响应拦截器（预留 Token 处理位置）。

### 1.3 数据库环境

- [x] **本地 Docker 环境**：
  - [x] 编写 `docker-compose.yml`。
  - [x] 配置 **PostgreSQL** 服务 (端口 5432)。
  - [x] 配置 **Redis** 服务 (端口 6379)。
  - [x] 启动容器并使用 DBeaver/Navicat 连接测试成功。

---

## 🥩 Milestone 2: 核心业务后端 (Backend Core)

**目标**：实现食材管理与核心的“BOM 成本递归计算”。

### 🧠 涉及知识点 (Knowledge Points)

- **NestJS 架构**: 深入理解 **Module** (模块化), **Controller** (路由), **Service** (业务逻辑) 的分层架构。
- **依赖注入 (DI)**: 理解 IoC (控制反转) 容器，`@Injectable()` 装饰器的作用，以及 Singleton (单例) 模式在 NestJS 中的应用。
- **ORM (TypeORM)**: 学习 Entity 定义，One-to-Many / Many-to-Many 关系映射，以及 Repository 模式。
- **算法 (递归/DFS)**: 学习深度优先搜索 (Depth-First Search) 算法，理解如何处理树形结构数据（BOM 表），以及如何检测循环引用（Cycle Detection）。
- **DTO (Data Transfer Object)**: 理解为什么需要 DTO 层来验证输入数据（配合 `class-validator`）。

### 2.1 NestJS 基础建设 (`apps/api`)

- [x] **初始化项目**：使用 `nest new apps/api` 创建后端。
- [x] **数据库连接**：
  - [x] 安装 `typeorm` `pg` `@nestjs/typeorm`。
  - [x] 在 `app.module.ts` 配置数据库连接（读取 `.env` 环境变量）。
- [x] **Swagger 集成**：
  - [x] 安装 `@nestjs/swagger`。
  - [x] 在 `main.ts` 配置 Swagger 文档路径 `/api/docs`。

### 2.2 基础数据模块 (Ingredients)

- [x] **实体设计 (Entity)**：创建 `Ingredient` 实体 (id, name, price, unit, nutrition_json)。
- [x] **DTO 定义**：在 `packages/types` 定义 `CreateIngredientDto`，后端引入使用。
- [x] **CRUD 实现**：实现食材的增删改查接口。

### 2.3 菜谱与 BOM 模块 (Recipes - 核心难点)

- [x] **实体设计**：
  - [x] `Recipe` (id, name, total_cost, steps, preProcessing)。
  - [x] `RecipeItem` (parent_id, child_recipe_id, ingredient_id, quantity, yield_rate)。
- [x] **递归计算逻辑 (Service)**：
  - [x] 编写 `calculateCost(recipeId)` 方法。
  - [x] **任务点**：实现深度优先遍历 (DFS)，如果 `RecipeItem` 是半成品，递归调用自身；如果是食材，直接计算 `price * quantity`。
  - [x] **任务点**：处理循环依赖检测（防止 A 包含 B，B 包含 A 导致死循环）。
- [x] **接口暴露**：`GET /recipes/:id/cost` 返回计算结果。

### 2.4 预处理流程模块 (Processing Methods)

- [x] **实体设计**：`ProcessingMethod` (id, name, description)。
- [x] **CRUD 实现**：实现预处理流程的增删改查接口。

### 2.5 销售菜单模块 (Sales Menu)

- [x] **实体设计**：`SalesMenu` (id, name, active), `SalesMenuItem` (menu_id, recipe_id, price)。
- [x] **CRUD 实现**：实现销售菜单的增删改查，支持关联多个菜谱。

### 2.6 用户与认证模块 (User & Auth)

- [x] **实体设计**：`User` (id, username, password, preferences)。
- [x] **认证机制**：
  - [x] 集成 `Passport` 和 `JWT` 策略。
  - [x] 实现 `AuthService` (validateUser, login)。
  - [x] 密码加密 (Bcrypt)。
- [x] **数据播种 (Seeding)**：自动创建默认管理员账号。

---

## 🍳 Milestone 3: 管理后台前端 (Admin Web)

**目标**：实现可视化的配方编辑器。

### 🧠 涉及知识点 (Knowledge Points)

- **Vue 3 Composition API**: 熟练使用 `setup`, `ref`, `reactive`, `computed`, `watch`。
- **状态管理 (Pinia)**: 理解 Store, State, Getter, Action 的概念，以及如何拆分 Store 模块。
- **拖拽交互 (Drag & Drop)**: 学习 HTML5 Drag and Drop API 原理，或者掌握 `vuedraggable` (基于 Sortable.js) 的事件钩子 (`start`, `end`, `change`)。
- **组件通信**: 深入理解 Props, Emits, Provide/Inject, 以及 `v-model` 的自定义实现。
- **数据可视化**: 理解 Canvas/SVG 绘图基础，ECharts 的配置项 (`option`) 设计模式。

### 3.1 Vue 3 基础建设 (`apps/admin`)

- [x] **初始化项目**：使用 `npm create vite@latest` (Vue + TS)。
- [x] **引入共享库**：在 `package.json` 添加依赖 `"@chefos/types": "workspace:*"`。
- [x] **UI 框架**：安装并配置 **Element Plus** 或 **Ant Design Vue**。
- [x] **状态管理**：配置 **Pinia**。

### 3.2 系统框架与菜单 (System Layout)

- [x] **路由与布局**：
  - [x] 安装 `vue-router`。
  - [x] 实现 `MainLayout`：侧边栏 (Sidebar) + 顶部导航 (Header) + 内容区 (Main)。
  - [x] **动态菜单 (Dynamic Menu)**：
    - [x] **后端**：创建 `Menu` 实体，实现菜单树接口 `GET /menus`。
    - [x] **配置化管理**：使用 `default-menus.json` 作为单一数据源，支持通过 API 一键同步 (`POST /menus/sync`)。
    - [x] **前端**：创建 `menuStore`，在应用启动时获取菜单配置，动态渲染侧边栏。
    - [x] **图标支持**：动态加载 Element Plus 图标组件。

### 3.3 核心业务功能 (Core Features)

- [x] **人员管理**：
  - [x] 简单的员工列表展示 (Mock 数据)。
- [x] **菜谱管理 (可视化编辑器)**：
  - [x] **布局搭建**：左侧“食材库列表”，中间“配方详情/预处理/制作步骤”，右侧“属性面板”。
  - [x] **拖拽实现**：
    - [x] 安装 `vuedraggable` 或 `dnd-kit`。
    - [x] 实现从左侧拖拽食材到中间，更新本地 JSON 数据结构。
    - [x] **交互优化**：拖拽食材时弹出“预处理选择”对话框，自动生成预处理步骤。
  - [x] **实时计算**：
    - [x] 利用 Vue `computed` 或 `watch`，当数量变化时，自动计算当前层级的预估成本。
- [x] **预处理管理**：
  - [x] 预处理流程的列表展示与增删管理。
  - [x] 支持定义描述模板（如：`将{ingredient}放入沸水中焯烫{time}秒`）。
- [x] **销售菜单管理**：
  - [x] 菜单列表与详情编辑。
  - [x] 关联菜谱管理。

### 3.5 代码重构与优化 (Refactoring)

- [x] **前端 API 层重构**：
  - [x] **模块化拆分**：将 `api.ts` 拆分为 `api/recipes.ts`, `api/users.ts` 等领域模块。
  - [x] **统一客户端**：创建 `api-client.ts` 作为基础 HTTP 客户端。
  - [x] **Store 升级**：更新所有 Pinia Store 使用新的 API 模块，解耦业务逻辑与底层 HTTP 请求。
  - [x] **前端列表页标准化**：
    - [x] **组件抽象**：提取 `ListLayout` 组件，统一 "搜索-工具栏-列表-分页" 结构。
    - [x] **页面重构**：重构所有列表页 (User, Recipe, Ingredient, Processing, SalesMenu) 适配新布局。

### 3.6 UI/UX 优化 (UI/UX Improvements)

- [x] **紧凑型商务风格 (Compact Business Style)**：
  - [x] 全局样式调整：缩小字体、间距，增加信息密度。
  - [x] Element Plus 组件样式覆盖。
- [x] **交互体验优化**：
  - [x] 侧边栏菜单支持折叠/展开。
  - [x] 优化配方编辑器布局，减少空白浪费。
- [x] **主题与布局系统 (Theming System)**：
  - [x] **动态密度切换**：支持 紧凑 (Compact)、默认 (Default)、宽松 (Loose) 三种密度模式，适应不同用户习惯。
  - [x] **主题架构**：基于 CSS Variables (`--app-padding`, `--app-font-size`) 的响应式设计，配合 Pinia 持久化用户偏好。
  - [x] **组件适配**：集成 `ElConfigProvider`，实现 Element Plus 组件尺寸与全局密度同步。
  - [x] **暗黑模式 (Dark Mode)**：集成 Element Plus Dark Theme，实现系统级深色模式切换。
  - [x] **云端偏好同步 (Cloud Sync)**：
    - [x] **后端支持**：扩展 User 实体存储 JSONB 格式的 `preferences`。
    - [x] **无感切换**：实现“本地优先 + 懒同步”策略，确保首屏渲染无闪动 (FOUC)。
    - [x] **双路径渲染**：针对新设备登录，实现 Loading 状态等待云端配置同步。

### 3.7 认证与安全 (Authentication & Security)

- [x] **登录页面 (Login Page)**：
  - [x] **现代分屏设计**：左侧品牌视觉区 + 右侧极简表单区。
  - [x] **响应式布局**：移动端自动适配。
  - [x] **交互细节**：输入框动效、Loading 状态、错误提示。
- [x] **前端认证逻辑**：
  - [x] **Pinia Auth Store**：管理 Token 和用户信息。
  - [x] **Axios 拦截器**：自动附加 Token，处理 401 过期跳转。
  - [x] **路由守卫**：防止未登录访问受保护页面。
- [x] **记住我 (Remember Me)**：
  - [x] 实现 `localStorage` (永久) 与 `sessionStorage` (会话级) 的切换策略。
- [x] **退出登录 (Logout)**：
  - [x] 实现前端登出逻辑，清除 Token 并跳转回登录页。

---

## 🚚 Milestone 4: 供应链与进阶后端 (Advanced Backend)

**目标**：模拟真实业务的复杂性（事务、定时任务）。

### 🧠 涉及知识点 (Knowledge Points)

- **数据库事务 (Transactions)**: 理解 ACID 特性 (Atomicity, Consistency, Isolation, Durability)。学习如何在代码中手动控制事务边界 (`startTransaction`, `commit`, `rollback`)。
- **并发控制**: 理解“超卖”问题，学习 悲观锁 (Pessimistic Locking, `SELECT ... FOR UPDATE`) 和 乐观锁 (Optimistic Locking, Version column) 的区别。
- **定时任务 (Cron)**: 学习 Cron 表达式语法 (e.g., `0 0 * * *`)，理解 Node.js 中的 Event Loop 如何处理定时器。
- **爬虫技术**: 理解 HTTP 协议，DOM 树结构，CSS 选择器 (用于 `cheerio` 解析)。

### 4.1 采购管理 (Procurement)

- [x] **采购清单生成**：
  - [x] 基于“菜谱”或“销售菜单”自动计算所需食材总量 (BOM 逆向计算)。
  - [x] 自动合并相同食材，计算预估成本。
- [x] **采购流程**：
  - [x] 生成采购单 (Pending 状态)。
  - [x] 确认入库 (Completed 状态)，自动增加库存 (`updateStock`)。

### 4.2 库存事务与并发 (Inventory Transactions)

- [ ] **销售下单 (Sales Order)**：
  - [ ] 编写“销售扣减”接口。
  - [ ] **任务点**：使用 `queryRunner.startTransaction()`。
  - [ ] **任务点**：先扣减 `Inventory` 表库存，再写入 `Order` 表。如果库存不足，抛出异常并 `rollback`。
- [ ] **并发锁测试**：使用 Apache Bench (ab) 或 Jmeter 模拟 100 个并发请求扣库存，验证是否超卖。

### 4.3 每日行情爬虫 (Crawler)

- [ ] **定时任务**：安装 `@nestjs/schedule`。
- [ ] **爬虫实现**：
  - [ ] 编写 Service 请求“新发地”网页。
  - [ ] 使用 `cheerio` 解析 HTML 表格。
  - [ ] 数据清洗（去除空格、单位转换）。
- [ ] **数据更新**：将爬取到的价格更新到 `Ingredient` 表，并记录日志。

---

## 🌏 Milestone 5: SSR 公开门户 (Public Portal - Next.js)

**目标**：使用 React 生态的 Next.js 构建高 SEO 权重的公开菜谱网站，体验“混合技术栈”开发。

### 🧠 涉及知识点 (Knowledge Points)

- **React vs Vue 思维差异**: 理解 JSX 的灵活性 vs Vue 模板的约束性；Hooks (useEffect) vs Lifecycle Hooks。
- **Next.js App Router**: 学习 Next.js 13+ 的最新架构，理解 **Server Components (RSC)** 与 Client Components 的边界与区别。
- **Tailwind CSS**: 学习原子化 CSS (Utility-first CSS)，这是 React/Next.js 生态中最流行的样式解决方案。
- **数据获取 (Data Fetching)**: 学习 Next.js 的 `fetch` 扩展，如何实现 SSG (Static Site Generation) 和 ISR (Incremental Static Regeneration)。

### 5.1 Next.js 环境搭建 (`apps/portal`)

- [ ] **初始化项目**：在 `apps/` 目录下运行 `npx create-next-app@latest portal` (选择 TypeScript, Tailwind CSS, App Router)。
- [ ] **配置代理/跨域**：在 `next.config.js` 中配置 `rewrites`，将 `/api` 请求转发到 NestJS 后端。
- [ ] **类型共享**：引入 `@chefos/types`，确保前端获取的菜谱数据类型与后端一致。

### 5.2 核心页面开发

- [ ] **首页 (Home)**：
  - [ ] 使用 `Server Component` 直接在服务端请求 NestJS 的“热门菜谱”接口。
  - [ ] 使用 Tailwind CSS 快速构建响应式网格布局。
- [ ] **菜谱详情页 (Detail)**：
  - [ ] 创建 动态路由 `app/recipe/[id]/page.tsx`。
  - [ ] **SEO 优化**：使用 `generateMetadata` 函数，根据 API 返回的菜谱名称动态生成 `<title>` 和 `<meta description>`。
  - [ ] **结构化数据**：注入 JSON-LD (Schema.org)，让 Google 能识别这是“食谱”并展示富文本搜索结果。

---

## 📱 Milestone 6: 移动端与离线优先 (Mobile PWA)

**目标**：后厨断网环境支持。

### 🧠 涉及知识点 (Knowledge Points)

- **PWA (Progressive Web Apps)**: 学习 Manifest.json (应用清单) 和 Service Worker (后台脚本) 的生命周期。
- **浏览器存储**: 深入理解 LocalStorage (同步, 5MB) vs IndexedDB (异步, 大容量, NoSQL) 的区别。
- **网络状态管理**: 学习 `navigator.onLine` 属性和 `online`/`offline` 事件监听。
- **同步策略**: 学习如何设计“操作队列” (Operation Queue)，保证离线操作按顺序同步到服务器。

### 6.1 移动端基础 (`apps/mobile`)

- [ ] **初始化**：Vue 3 + Vant UI。
- [ ] **PWA 配置**：
  - [ ] 安装 `vite-plugin-pwa`。
  - [ ] 配置 `manifest.json` (图标、名称、启动屏)。
  - [ ] 配置 Service Worker 缓存策略 (Stale-while-revalidate)。

### 6.2 离线数据层 (Offline Layer)

- [ ] **IndexedDB 封装**：
  - [ ] 安装 `dexie`。
  - [ ] 定义本地数据库 Schema (`recipes`, `sync_queue`)。
- [ ] **同步逻辑 (Sync Engine)**：
  - [ ] 编写 `useSync` Hook。
  - [ ] **任务点**：监听 `window.online` 事件。
  - [ ] **任务点**：网络恢复时，读取 `sync_queue` 表，循环发送请求到后端。

---

## 🚀 Milestone 7: 运维与部署 (DevOps)

**目标**：容器化与自动化。

### 🧠 涉及知识点 (Knowledge Points)

- **Docker 进阶**: 学习 Multi-stage builds (多阶段构建) 以减小镜像体积。理解 Docker Layer Caching (层缓存) 机制。
- **Kubernetes (K8s)**:
  - **Pod**: 最小部署单元。
  - **Deployment**: 管理 Pod 的副本和滚动更新。
  - **Service**: 暴露服务 (ClusterIP, NodePort, LoadBalancer)。
  - **Ingress**: HTTP/HTTPS 路由入口。
  - **ConfigMap/Secret**: 配置管理与敏感信息存储。
- **CI/CD**: 理解 Continuous Integration (持续集成) 和 Continuous Deployment (持续部署) 的流程。学习 GitHub Actions 的 YAML 语法。

### 7.1 Docker 化

- [ ] **编写 Dockerfile**：
  - [ ] 为 `apps/api` 编写 Dockerfile (注意 Monorepo 的依赖剪裁，使用 `turbo prune`)。
  - [ ] 为 `apps/admin` 编写 Dockerfile (Nginx 托管静态资源)。
- [ ] **镜像构建**：本地运行 `docker build` 验证镜像是否可用。

### 7.2 K8s 部署 (Minikube/K3s)

- [ ] **编写 K8s Manifests**：
  - [ ] `postgres-deployment.yaml` & `postgres-service.yaml`。
  - [ ] `redis-deployment.yaml`。
  - [ ] `api-deployment.yaml` (配置 ConfigMap 注入环境变量)。
  - [ ] `web-deployment.yaml`。
- [ ] **Ingress 配置**：配置 Nginx Ingress Controller，实现通过域名 `chefos.local` 访问。

### 7.3 CI/CD (GitHub Actions)

- [ ] **配置 Workflow**：
  - [ ] `.github/workflows/ci.yml`。
  - [ ] 触发条件：Push 到 main 分支。
  - [ ] 步骤：Install -> Lint -> Test -> Build Docker Image。

---

## 🛡️ Milestone 8: 生产环境加固 (Production Readiness)

**目标**：弥补开发环境与生产环境的差距，确保安全性、稳定性和可观测性。

### 🧠 涉及知识点 (Knowledge Points)

- **安全防御**: 深入理解 OWASP Top 10 漏洞。学习 Rate Limiting (限流)、Helmet (安全头)、CORS 配置。
- **数据库可靠性**: 理解 Database Migrations (迁移) 的重要性，以及 ACID 事务在复杂业务中的应用。
- **可观测性 (Observability)**: 学习 "Logs, Metrics, Tracing" 三大支柱。掌握结构化日志 (Structured Logging) 和健康检查 (Health Checks)。

### 8.1 安全性增强 (Security - P0/P1)

- [x] **精细化权限控制 (RBAC)**:
  - [x] 实现全局 `RolesGuard`。
  - [x] 自定义装饰器 `@RequirePermissions('user:create')`。
- [x] **防御性中间件**:
  - [x] 引入 `helmet` 设置 HTTP 安全头。
  - [x] 引入 `@nestjs/throttler` 实现接口限流 (Rate Limiting)，防止暴力破解。
  - [x] 严格配置 CORS，仅允许特定域名访问。
- [x] **数据校验与脱敏**:
  - [x] 环境变量强校验 (使用 `joi` 或 `zod`)，启动时缺配置直接报错。
  - [x] 全局异常过滤器 (Global Exception Filter)，屏蔽内部错误堆栈。
  - [ ] 日志脱敏 (Masking)，防止密码/Token 泄露。
- [x] **审计与版本控制**:
  - [x] **操作审计 (Audit Log)**：记录关键操作 (Create/Update/Delete) 的操作人、时间、资源 ID。
  - [x] **数据版本 (Versioning)**：食材 (Ingredient) 修改时自动保存历史版本快照，支持追溯。

### 8.2 数据库可靠性 (Database Reliability - P0)

- [x] **迁移管理 (Migrations)**:
  - [x] **禁止** `synchronize: true`。
  - [x] 配置 TypeORM CLI，建立标准的 Migration 流程 (Generate -> Run -> Revert)。
- [x] **事务管理 (Transactions)**:
  - [x] 重构复杂业务逻辑，使用 `QueryRunner` 或 `EntityManager` 确保原子性。
- [ ] **性能优化**:
  - [ ] 解决 N+1 查询问题 (使用 `relations` 或 `DataLoader`)。

### 8.3 可观测性与标准化 (Observability - P1)

- [x] **标准化响应**:
  - [x] 定义统一响应结构 `{ code: 200, data: ..., message: 'success' }`。
  - [x] 实现 `TransformInterceptor` 统一封装响应。
- [x] **结构化日志**:
  - [x] 替换 `console.log` 为 `nestjs-pino` (基于 Pino)，输出 JSON 格式日志。
  - [ ] 配置 Request ID (Trace ID) 贯穿全链路。
- [x] **健康检查**:
  - [x] 引入 `@nestjs/terminus`，暴露 `/health` 接口供 K8s 探针检测。

### 8.4 前端健壮性 (Frontend Robustness)

- [ ] **错误边界 (Error Boundaries)**: 使用 `onErrorCaptured` 防止单组件崩溃导致白屏。
- [x] **请求竞态处理**: 封装 Axios 取消重复请求 (AbortController)。

---

## 💾 进阶数据库设计 (Advanced Database Patterns)

**目标**：引入企业级数据库设计模式，解决复杂关系、性能瓶颈与数据审计问题。

### 🧠 涉及知识点 (Knowledge Points)

- **软删除 (Soft Delete)**: 逻辑删除而非物理删除，保证数据可恢复性与历史关联完整性。
- **闭包表 (Closure Table)**: 解决无限层级树形结构（如 BOM 表）的高效查询。
- **物化视图 (Materialized View)**: 预计算复杂查询结果（如实时成本），以空间换时间。
- **JSONB 索引 (GIN)**: 在关系型数据库中高效存储与检索非结构化数据。

### 9.1 已实现模式 (Implemented)

- [x] **软删除 (Soft Delete)**:
  - [x] **核心实体**：`Recipe`, `Ingredient`, `User`, `SalesMenu`, `ProcessingMethod`。
  - [x] **实现方式**：添加 `@DeleteDateColumn()`，TypeORM 自动处理 `deleted_at IS NULL` 过滤。
  - [x] **价值**：防止误删导致的历史报表数据缺失。

### 9.2 规划中模式 (Planned)

- [ ] **闭包表 (Closure Table)**:
  - [ ] **场景**：菜谱 BOM 的多级嵌套查询。
  - [ ] **方案**：创建 `recipe_closure` 表存储所有祖先-后代关系，替代递归查询。
- [ ] **物化视图 (Materialized View)**:
  - [ ] **场景**：实时计算数百个菜谱的动态成本。
  - [ ] **方案**：创建 `recipe_costs` 视图，在食材价格变动时触发刷新。
- [ ] **JSONB GIN 索引**:
  - [ ] **场景**：菜谱步骤 (`steps`) 的全文检索。
  - [ ] **方案**：`CREATE INDEX ON recipe USING GIN (steps)`。
