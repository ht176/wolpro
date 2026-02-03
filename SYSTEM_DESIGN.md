# WOL 内网管理系统 - 系统设计文档

本文档详细描述了 WOL (Wake-on-LAN) 内网管理系统的设计方案，包括系统架构、功能模块、技术选型等。

---

## **1. 概要设计**

本系统旨在提供一个简单易用的 Web 界面，用于扫描、管理和唤醒局域网内的设备。

### 1.1. 系统架构

- **前端 (Frontend):** 使用 **Vue.js 3** 框架构建单页应用 (SPA)。负责所有用户交互、数据显示、发起扫描和唤醒请求。
- **后端 (Backend):** 使用 **NestJS** 框架构建。负责处理核心业务逻辑，包括设备扫描、发送 WOL 魔法数据包、设备信息的持久化管理，并通过 `REST API` 和 `WebSocket` 与前端进行通信。
- **数据存储 (Data Storage):** 使用 **SQLite** 数据库。它是一个轻量级的、基于文件的数据库，无需单独安装和配置数据库服务，非常适合此类中小型应用，可以方便地随应用一起打包和分发。
- **通信协议 (Communication):**
  - **REST API:** 用于处理常规的设备信息管理请求（增、删、改、查）。这是一种无状态的、标准的Web接口形式。
  - **WebSocket:** 用于实现需要实时通信的功能。特别是设备扫描，后端服务会将扫描到的设备信息实时推送给前端，用户可以即时看到扫描结果，无需等待扫描完成或手动刷新页面。

### 1.2. 功能模块划分

#### **后端 (NestJS)**

- **API 文档**: 集成 **Swagger** (`@nestjs/swagger`)，自动生成 OpenAPI 规范文档，访问地址为 `/api`。
- **认证模块 (`AuthModule`):**
  - 提供基础的登录认证功能（如 JWT），保护设备管理和唤醒接口，防止未授权访问。
- **设备管理模块 (`DeviceModule`):**
  - `DeviceController`: 提供 `/devices` 路径下的 RESTful API 接口，用于获取、添加、更新和删除已保存的设备。
  - `DeviceService`: 封装对数据库的所有操作逻辑（CRUD）。
  - `DeviceEntity`: 使用 TypeORM 定义设备的数据模型，包含 `id`, `name`, `ipAddress`, `macAddress`, `notes` 等字段。
  - **状态检测**: 集成 ICMP Ping 功能，用于检测已保存设备的在线状态（Online/Offline）。
- **网络扫描模块 (`ScanModule`):**
  - `ScanGateway`: 使用 `@nestjs/websockets` 实现 WebSocket 服务。它会监听前端的“开始扫描”指令，并在扫描过程中将新发现的设备信息（IP、MAC地址）实时推送给前端。
  - `ScanService`: 实现核心的扫描逻辑。通过调用系统底层命令（如 `arp-scan`）或相关的 Node.js 库来发现网络中的活动主机及其MAC地址。
- **网络唤醒模块 (`WolModule`):**
  - `WolController`: 提供一个用于唤醒设备的 API 接口，例如 `POST /wol`，请求体中包含目标设备的 MAC 地址。
  - `WolService`: 封装发送 WOL 魔法数据包（Magic Packet）的具体逻辑。
  - **定时任务**: (可选) 集成 `@nestjs/schedule`，支持设置定时唤醒任务（如每天早上 9 点自动唤醒）。

#### **前端 (Vue.js)**

- **登录页面 (`Login.vue`):** 简单的用户认证界面。
- **设备列表 (`DeviceList.vue`):** 应用的主页面，通常会分为“已保存设备”和“新发现设备”两个区域，以便用户区分。
- **设备项 (`DeviceItem.vue`):** 展示单个设备信息，集成“唤醒”、“编辑”、“删除”按钮，并显示**在线状态指示灯**。
- **控制面板 (`ControlPanel.vue`):** 包含全局操作，如“扫描全网”按钮和扫描状态指示器（例如，显示“扫描中...”或“扫描完成”）。
- **设备编辑/添加弹窗 (`DeviceModal.vue`):** 一个模态框表单，用于手动添加新设备或修改已有设备的信息。

---

## **2. 技术选型与调研**

### 2.1. 后端技术栈 (Backend)

- **核心框架:** **NestJS** (`@nestjs/core`, `@nestjs/platform-express`)
- **数据库 ORM:** **TypeORM** (`@nestjs/typeorm`, `typeorm`)
- **数据库驱动:** **SQLite** (`sqlite3`)
- **实时通信:** **`@nestjs/websockets`** (基于 `Socket.IO`)
- **网络扫描:**
  - **首选方案:** 使用 **`arp-scan`** 命令行工具。这是一个强大的工具，可以直接获取局域网内设备的 IP 和 MAC 地址。后端通过 Node.js 的 `child_process` 模块执行该命令并解析输出。**注意：** 在某些系统上，运行 `arp-scan` 可能需要管理员（`sudo`）权限。
  - **备选方案:** 纯 Node.js 实现。可以组合 `ping` 和 `node-arp` 等库，先 `ping` 整个网段以填充系统的 ARP 缓存，然后通过读取 ARP 表获取 IP 与 MAC 的对应关系。此方案跨平台性更好，但实现起来可能更复杂。
- **网络唤醒 (WOL):** 使用 `wol` 或 `wake_on_lan` npm 包。这两个库都非常轻量且易于使用，核心功能是根据目标设备的 MAC 地址构建并发送魔法数据包。
- **定时任务:** **`@nestjs/schedule`** (基于 `cron`)。

### 2.2. 前端技术栈 (Frontend)

- **构建工具:** **Vite** - 提供极速的开发服务器启动速度和高效的热模块替换 (HMR)。
- **核心框架:** **Vue 3** (使用组合式 API `Composition API` 风格，能更好地组织代码逻辑)。
- **UI 框架:** **Element Plus** (配合 `unplugin-vue-components` 实现按需自动导入) - 提供一套美观且功能丰富的企业级组件库。
- **CSS 框架:** **UnoCSS** - 即时按需原子化 CSS 引擎，提供轻量、高性能的样式开发体验。
- **HTTP 客户端:** **Axios** (配合 **NSwag**) - 使用 NSwag 根据后端 Swagger 文档自动生成 TypeScript 客户端代码，确保前后端接口类型安全且同步。
- **状态管理:** **Pinia** - Vue 3 官方推荐的新一代状态管理库，设计更轻量、直观，且对 TypeScript 支持友好。
- **WebSocket 客户端:** **`socket.io-client`** - `Socket.IO` 的官方客户端库，用于与后端的 WebSocket 服务进行配对通信。

## **3. 部署注意事项**

- **Docker 部署:**
  - 由于 WOL (UDP 广播) 和 ARP 扫描 (二层协议) 的特殊性，容器化部署时必须使用 **Host 网络模式** (`network_mode: host`)，否则无法发送广播包或接收 ARP 响应。
- **权限:**
  - `arp-scan` 通常需要 root 权限，容器内部默认通常是 root，但在宿主机直接运行时需注意权限配置。
