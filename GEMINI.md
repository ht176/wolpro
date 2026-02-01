# Gemini Code Assist Skills - WOLPRO

## 1. 项目概况

**wolpro** 是一个局域网设备管理与唤醒（WOL）系统。

- **架构**: Monorepo (前后端分离)
- **根目录**: `c:\Work\Source\wolpro`

## 2. 技术栈规范

### Backend (`/backend`)

- **框架**: NestJS (v11)
- **语言**: TypeScript
- **数据库**: SQLite + TypeORM
- **API**: RESTful (常规操作) + WebSocket (Gateway, 用于实时扫描)
- **核心库**: `wake_on_lan` (WOL), `child_process` (网络扫描)
- **风格**:
  - 严格遵守 NestJS 模块化结构 (Module, Controller, Service, Entity, DTO)。
  - 尽量使用依赖注入。
  - 文件命名: `*.controller.ts`, `*.service.ts`, `*.entity.ts`.

### Frontend (`/frontend`)

- **框架**: Vue 3 + TypeScript (Composition API, `<script setup lang="ts">`)

- **构建**: Vite
- **UI 组件**: Element Plus (按需引入)
- **状态管理**: Pinia
- **通信**: Axios (REST) + Socket.io-client (WebSocket)
- **风格**:
  - 组件名使用 PascalCase (如 `DeviceList.vue`).
  - 优先使用组合式 API。
  - 样式使用 CSS/SCSS，尽量 Scoped。

## 3. 常用任务指南

### 启动开发环境

1. **后端**: `cd backend && npm run start:dev` (Port: 3000)
2. **前端**: `cd frontend && npm run dev` (Port: 5173)

### 关键业务逻辑

- **设备扫描**: 后端 `ScanService` 执行扫描，通过 WebSocket (`events` 网关) 实时推送 `scan-result` 事件给前端。
- **唤醒**: POST `/wol` 触发魔法包发送。

## 4. 交互准则 (对于 AI)

- 修改代码时，**优先**保持现有的目录结构和命名约定。
- 如果涉及数据库结构变更，必须同步更新 `Entity` 和 `DTO`。
- 修改 API 时，请同时检查前端 `src/api` 或 `stores` 中的调用逻辑。

## 5. 核心技能与模式 (Skills & Patterns)

### Backend Skills (NestJS)

#### **1. 资源 CRUD 模式**

创建新资源时，遵循标准 NestJS 流程：

1.  **Entity**: 定义数据库模型 (`*.entity.ts`)。
2.  **DTO**: 定义输入验证 (`create-*.dto.ts`, `update-*.dto.ts`)，使用 `class-validator`。
3.  **Service**: 注入 Repository，实现业务逻辑。
4.  **Controller**: 定义路由，处理 HTTP 请求。

#### **2. 实时通信模式 (WebSocket)**

- 使用 `@WebSocketGateway` 装饰器。
- 发送事件: `server.emit('event-name', data)`。
- 接收事件: `@SubscribeMessage('event-name')`。
- **示例**: 扫描进度推送应使用 WebSocket 而非轮询。

#### **3. 依赖与环境**

- **Docker 兼容**: 任何涉及网络（扫描/WOL）的功能，必须考虑 Docker 的 `host` 网络模式限制。
- **原生依赖**: 如 `sqlite3`, `arp-scan` 等原生模块，需注意跨平台兼容性（Win/Linux）。

### Frontend Skills (Vue 3 + TypeScript)

**Skills Directory**: `.agents/skills`

#### **1. TypeScript 规范**

- 组件必须使用 `<script setup lang="ts">`。

- 为 Props 和 Emits 定义类型接口。

- **API 数据**: 为所有 API 响应定义 interface（推荐在 `src/types` 或同文件内）。

