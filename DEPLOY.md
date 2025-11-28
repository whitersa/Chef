# ChefOS 部署指南

这份文档是专门为运维新手准备的，旨在帮助你理解并完成 ChefOS 项目的部署。

## 1. 整体架构图解

首先，我们需要理解这个项目运行起来是什么样子的：

```mermaid
graph TD
    User[用户浏览器] --> |访问 http://your-domain.com| Nginx[Nginx 服务器]

    subgraph 服务器内部
        Nginx --> |请求静态资源 (html/css/js)| Frontend[前端文件 (dist目录)]
        Nginx --> |请求数据接口 (/api)| Backend[后端服务 (NestJS :3000)]

        Backend --> |读写数据| PostgreSQL[PostgreSQL 数据库]
        Backend --> |读写缓存| Redis[Redis 缓存]
    end
```

**简单来说：**

1.  **前端 (Vue)**：编译后就是一堆文件（HTML, CSS, JS），需要用 **Nginx** 这种软件把它们“展示”给用户。
2.  **后端 (NestJS)**：是一个一直在运行的程序（服务），监听在某个端口（比如 3000），处理数据请求。
3.  **Nginx**：是守门员。用户要看页面，它给页面文件；用户要数据，它把请求转交给后端。

---

## 2. 准备工作 (环境要求)

在你的服务器（Linux/Windows Server）上，你需要安装：

1.  **Node.js** (版本 >= 18) - 运行后端和构建前端必须。
2.  **PostgreSQL** (版本 14+ 推荐) - 数据库。
3.  **Redis** - 缓存服务。
4.  **Nginx** - Web 服务器。
5.  **PM2** (可选但推荐) - 用来管理后端进程，保证它挂了能自动重启。
    - 安装命令: `npm install -g pm2`

---

## 3. 后端部署 (API)

后端是一个 Node.js 程序，我们需要把它跑起来。

### 步骤：

1.  **上传代码**：将 `apps/api` 目录上传到服务器。
2.  **安装依赖**：
    ```bash
    cd apps/api
    npm install
    ```
3.  **配置环境变量**：
    - 复制 `.env.example` 为 `.env`。
    - 修改里面的数据库配置 (`DB_HOST`, `DB_PASSWORD` 等) 和 Redis 配置。
4.  **构建代码**：
    ```bash
    npm run build
    ```
    _构建完成后会生成一个 `dist` 目录。_
5.  **启动服务**：
    - **普通启动** (测试用): `node dist/main`
    - **PM2 启动** (生产推荐):
      ```bash
      pm2 start dist/main.js --name "chef-api"
      ```
      _此时，后端应该已经在服务器的 3000 端口运行了。_

### ❓ 疑问：现在生产环境还用 PM2 吗？

**答案是：用的，而且非常多。**

虽然现在 **Docker** 和 **Kubernetes (K8s)** 是大厂和微服务架构的主流，但在以下场景中，**PM2 仍然是首选**：

1.  **单机部署 / VPS**：如果你只有一台服务器，直接跑 Node.js + PM2 是最简单、性能损耗最小的方式。
2.  **运维新手**：Docker 的学习曲线较陡峭（需要懂镜像、容器、网络、挂载等），而 PM2 只需要几行命令。
3.  **老旧项目维护**：很多现存项目都在用 PM2。

**对比：**

- **PM2**: 相当于给你的 Node 程序请了个“保姆”，挂了负责重启，还能看日志。
- **Docker**: 相当于给你的程序盖了个“集装箱”，不管搬到哪里（服务器 A、服务器 B）都能直接跑，环境完全一致。

_如果你是初学者，建议先从 PM2 开始；等你熟悉了 Linux 和基本部署流程后，再尝试 Docker。_

---

## 4. 前端部署 (Admin)

前端不需要“运行”，只需要“构建”出静态文件，然后让 Nginx 负责提供下载。

### 步骤：

1.  **本地构建** (推荐在本地电脑做，服务器配置低可能构建慢)：
    在项目根目录或 `apps/admin` 下运行：

    ```bash
    npm run build
    ```

    _这会在 `apps/admin/dist` 目录下生成一堆文件（包含 .gz 压缩文件）。_

2.  **上传文件**：
    将本地生成的 `apps/admin/dist` 文件夹里的**所有内容**，上传到服务器的某个目录，例如 `/var/www/chef-admin`。

3.  **配置 Nginx**：
    我们已经准备好了一个配置文件模板：`apps/admin/deploy/nginx.conf`。
    - 将该文件内容复制到服务器 Nginx 的配置目录（通常是 `/etc/nginx/conf.d/chef.conf`）。
    - **修改配置中的路径**：
      - `root /usr/share/nginx/html;` -> 修改为你上传文件的路径，例如 `root /var/www/chef-admin;`
      - `proxy_pass http://localhost:3000/;` -> 确保这里的地址能访问到你的后端服务。

4.  **重启 Nginx**：
    ```bash
    nginx -t   # 检查配置有没有写错
    nginx -s reload # 重启 Nginx
    ```

---

## 5. 数据库备份 (PostgreSQL)

数据是无价的，定期备份非常重要。PostgreSQL 提供了 `pg_dump` 工具来导出数据。

### 手动备份

```bash
# 格式: pg_dump -U [用户名] -h [主机] -d [数据库名] > [备份文件名].sql
pg_dump -U postgres -h localhost -d chef_db > chef_backup_2025.sql
```

_输入命令后通常需要输入数据库密码。_

### 自动定时备份 (Linux Crontab)

我们可以写一个简单的脚本，每天凌晨 2 点自动备份。

1.  **创建备份脚本** `backup.sh`:

    ```bash
    #!/bin/bash
    # 设置备份目录
    BACKUP_DIR="/var/backups/postgres"
    mkdir -p $BACKUP_DIR

    # 生成带日期的文件名
    FILENAME="$BACKUP_DIR/chef_db_$(date +%Y%m%d).sql"

    # 执行备份 (建议配置 .pgpass 文件以免密执行)
    pg_dump -U postgres -h localhost -d chef_db > $FILENAME

    # 删除 7 天前的旧备份 (节省空间)
    find $BACKUP_DIR -type f -name "*.sql" -mtime +7 -delete
    ```

2.  **添加定时任务**:
    运行 `crontab -e` 并添加：
    ```bash
    0 2 * * * /bin/bash /path/to/backup.sh
    ```

---

## 6. 配置 HTTPS (SSL 证书)

为了安全，强烈建议使用 HTTPS。我们可以使用 **Certbot** 免费申请 Let's Encrypt 证书。

### 步骤：

1.  **安装 Certbot**:

    ```bash
    # Ubuntu/Debian
    sudo apt install certbot python3-certbot-nginx
    ```

2.  **申请证书并自动配置 Nginx**:

    ```bash
    # 替换为你自己的域名
    sudo certbot --nginx -d your-domain.com
    ```

3.  **按照提示操作**:
    - 输入邮箱（用于接收续期提醒）。
    - 同意协议。
    - Certbot 会自动修改你的 Nginx 配置文件，添加 SSL 相关的配置（监听 443 端口，加载证书路径等）。

4.  **自动续期**:
    Let's Encrypt 证书有效期只有 90 天，但 Certbot 会自动添加定时任务来续期。你可以运行以下命令测试续期功能是否正常：
    ```bash
    sudo certbot renew --dry-run
    ```

---

## 8. 进阶部署：Docker & Kubernetes (K8s)

当你需要管理多台服务器，或者希望环境绝对一致时，Docker 是最佳选择。

### 8.1 Docker Compose 一键部署 (推荐)

我们已经为您准备好了 `docker-compose.prod.yml` 文件，它可以一次性启动数据库、Redis、后端和前端。

**步骤：**

1.  **安装 Docker**:
    在服务器上安装 Docker 和 Docker Compose。

2.  **上传代码**:
    将整个项目代码上传到服务器。

3.  **启动服务**:
    在项目根目录下运行：

    ```bash
    # -f 指定配置文件，-d 后台运行
    docker-compose -f docker-compose.prod.yml up -d --build
    ```

    _等待几分钟构建完成后，访问服务器 IP 即可看到项目。_

**原理说明：**

- `apps/api/Dockerfile`: 定义了后端怎么构建（安装依赖 -> 编译 TS -> 启动）。
- `apps/admin/Dockerfile`: 定义了前端怎么构建（编译 Vue -> 放入 Nginx）。
- `docker-compose.prod.yml`: 编排这 4 个容器（Postgres, Redis, API, Admin），让它们在一个虚拟网络里互相能访问。

---

### 8.2 Kubernetes (K8s) 部署流程 (了解)

K8s 是企业级容器编排工具，适合大规模集群。如果你只有几台机器，K8s 可能有点“杀鸡用牛刀”，但了解流程很有必要。

**核心流程：**

1.  **构建镜像 (Build)**:
    你需要把 API 和 Admin 打包成镜像，并推送到镜像仓库（如 Docker Hub 或 阿里云镜像仓库）。

    ```bash
    # 示例
    docker build -t my-registry/chef-api:v1 -f apps/api/Dockerfile .
    docker push my-registry/chef-api:v1
    ```

2.  **编写 YAML 配置**:
    K8s 不使用 docker-compose，而是使用 YAML 文件来描述资源。你需要编写：
    - `Deployment`: 定义运行几个副本（Pod）。
    - `Service`: 定义内部网络如何访问。
    - `Ingress`: 定义外部域名如何访问。

3.  **部署 (Apply)**:
    ```bash
    kubectl apply -f k8s/
    ```

**K8s 相比 Docker Compose 的优势：**

- **自愈能力**：某个 Pod 挂了，K8s 会自动在其他机器上重启它。
- **滚动更新**：发布新版本时，可以一个一个替换，用户无感知。
- **弹性伸缩**：流量大了自动加机器，流量小了自动减。

---

## 9. 常见问题排查

- **页面一片白，控制台报错 404**：
  - 检查 Nginx 配置里的 `root` 路径是否正确。
  - 检查是否配置了 `try_files $uri $uri/ /index.html;`。

- **接口报错 404 或 502**：
  - 检查后端服务是否启动 (`pm2 list`)。
  - 检查 Nginx 的 `location /api/` 配置是否正确指向了后端端口。

- **Gzip 没生效 (文件还是很大)**：
  - 检查 Nginx 配置里是否有 `gzip_static on;`。
  - 检查上传的目录里是否包含 `.gz` 后缀的文件。
