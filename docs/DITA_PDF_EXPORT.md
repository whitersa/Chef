# DITA-OT PDF 导出功能详解

本文档详细说明了 ChefOS 项目中基于 DITA-OT 的 PDF 导出功能的实现原理、架构设计及开发指南。

## 1. 架构概览

ChefOS 使用 [DITA-OT (DITA Open Toolkit)](https://www.dita-ot.org/) 作为核心发布引擎，将结构化的食谱数据（Recipe）转换为专业的 PDF 文档。

### 核心组件

1.  **DitaGeneratorService** (`apps/api/src/publisher/services/dita-generator.service.ts`)
    - 负责将数据库中的 `Recipe` JSON 对象转换为符合 DITA 标准的 XML (`.dita` 和 `.ditamap`)。
    - **关键处理**：强制在根节点注入 `xml:lang="zh-CN"`，确保后续 PDF 渲染引擎能正确识别语言环境。

2.  **DitaRunnerService** (`apps/api/src/publisher/services/dita-runner.service.ts`)
    - 负责编排构建流程。
    - **环境管理**：自动检测并使用项目内置的 `tools/dita-ot-4.2` 和 `tools/java-17`，实现零依赖运行。
    - **插件同步**：每次构建前自动将 `tools/dita-plugins/com.chefos.pdf` 同步到 DITA-OT 运行环境。

3.  **DITA-OT 引擎** (`tools/dita-ot-4.2`)
    - 项目内置的发布引擎，版本 4.2。

4.  **自定义插件** (`tools/dita-plugins/com.chefos.pdf`)
    - 定义了专属的转换类型 `chefos-pdf`。
    - 包含字体映射、布局定制和样式覆盖。

## 2. 中文字体支持方案

在 DITA-OT 默认配置下，中文字符在 PDF 标题中常显示为 "####"。我们通过以下全链路方案解决了此问题：

### 2.1 数据源层 (`DitaGeneratorService`)

生成 XML 时，必须声明语言环境：

```xml
<task id="..." xml:lang="zh-CN">
  ...
</task>
```

这告诉 FOP 处理器使用中文配置。

### 2.2 逻辑字体映射 (`font-mappings.xml`)

位于 `tools/dita-plugins/com.chefos.pdf/cfg/fo/font-mappings.xml`。
我们将逻辑字体（Logical Font）映射到物理字体（Physical Font）：

```xml
<logical-font name="Sans">
  <physical-font char-set="Simplified Chinese">
    <font-face>Microsoft YaHei</font-face> <!-- 优先使用微软雅黑 -->
    <font-face>SimHei</font-face>
    <font-face>SimSun</font-face>
  </physical-font>
</logical-font>
```

### 2.3 样式定义 (`custom.xsl`)

位于 `tools/dita-plugins/com.chefos.pdf/cfg/fo/attrs/custom.xsl`。
我们不再硬编码字体名称（如 `Arial`），而是使用逻辑名称：

```xml
<xsl:variable name="title-font-family">Sans</xsl:variable>
```

## 3. 开发与调试

### 3.1 自动同步机制

为了提升开发体验，`DitaRunnerService` 实现了智能同步：

- **开发位置**：直接修改 `tools/dita-plugins/com.chefos.pdf` 下的源码。
- **运行时**：服务在生成 PDF 前会检查文件变更。
  - 如果只是修改 `.xsl` 或 `.xml` 样式文件：自动复制到 DITA-OT 目录（毫秒级）。
  - 如果修改了 `plugin.xml`：自动触发 `dita --install` 集成命令。

### 3.2 手动测试

如果需要脱离 API 服务手动测试 PDF 生成，可以使用以下命令：

```powershell
# 1. 设置 Java 环境
$env:JAVACMD = "C:\Users\lilong.bai\Documents\develop\chef\tools\java-17\bin\java.exe"

# 2. 运行 DITA 命令
.\tools\dita-ot-4.2\bin\dita.bat -i temp/test/hello.ditamap -f chefos-pdf -o temp/out --verbose
```

## 4. 常见问题排查

### Q: 标题显示为 "####"

- **检查**：生成的 XML 是否包含 `xml:lang="zh-CN"`。
- **检查**：服务器/开发机是否安装了 `Microsoft YaHei` 或 `SimSun` 字体。

### Q: 500 Error: stdout maxBuffer length exceeded

- **原因**：DITA-OT 输出日志过多，超过了 Node.js `exec` 的默认缓冲区。
- **解决**：`DitaRunnerService` 中已将 `maxBuffer` 设置为 10MB。

### Q: Java 版本错误

- **原因**：DITA-OT 4.2 需要 Java 17+。
- **解决**：服务会自动优先寻找 `tools/java-17`，确保不依赖系统 Java 版本。
