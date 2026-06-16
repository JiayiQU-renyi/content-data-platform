# 个人内容评价数据平台 Content Data Platform

> 基于真实观影数据的内容评价与用户行为分析平台，覆盖埋点采集 → ETL 加工 → 数仓建模 → OLAP 查询 → 可视化看板全链路。

[![Build](https://img.shields.io/badge/status-WIP-yellow)]() [![License](https://img.shields.io/badge/data-CC%20BY--NC%204.0-blue)]() [![Tech](https://img.shields.io/badge/stack-Hive%20%7C%20Kafka%20%7C%20Flink%20%7C%20ClickHouse-success)]()

🌐 **在线 Demo**：[https://github.com/JiayiQU-renyi/content-data-platform](#)

---

## 📖 项目背景

这是一个面向影视、剧集与音乐剧三类内容形态的端到端数据工程实践项目。区别于纯模拟项目，本项目融合了 **IMDb 公开数据集**、**MovieLens 真实用户行为数据**与**个人多年观影记录**，在合法合规的前提下构建了一个完整的数据平台。

## 🏗️ 技术架构

```
                  前端展示（HTML / CSS / JS / ECharts）
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ClickHouse (OLAP)              静态指标 JSON
              ▲                               ▲
              │                               │
          Flink                       Hive + PySpark
       (实时数仓)                       (离线数仓)
              ▲                               ▲
              │                               │
          Kafka                          本地文件系统
       (事件总线)                        (HDFS 模拟)
              ▲                               ▲
              └───────────────┬───────────────┘
                              │
        IMDb 数据集 + MovieLens 25M + 个人观影记录 + TMDb API
```

## 🧱 数仓分层

| 层级 | 含义 | 本项目内容 |
|---|---|---|
| ODS | 原始数据层 | 直接 load 进来的 IMDb / MovieLens 原始表 |
| DWD | 明细数据层 | 清洗后的用户行为明细、内容明细 |
| DWS | 汇总数据层 | 用户画像、内容热度、类型聚合 |
| ADS | 应用数据层 | 看板指标：DAU、热度榜、用户偏好分布 |

## 📂 项目结构

```
content-data-platform/
├── docs/              # 设计文档、架构图、埋点方案
├── data/              # 数据源说明与个人数据
├── etl/               # 数仓 SQL（ODS → DWD → DWS → ADS）
├── streaming/         # Kafka 生产者 + Flink 实时作业
├── frontend/          # 前端展示
├── infra/             # Docker Compose 与基础设施
└── notebooks/         # 数据探索 Jupyter Notebook
```

## 📊 数据源声明（合规说明）

| 数据源 | 内容 | 协议 | 商用 |
|---|---|---|---|
| [IMDb Non-Commercial Datasets](https://developer.imdb.com/non-commercial-datasets/) | 影视元数据 | CC BY-NC 4.0 | ❌ |
| [MovieLens 25M](https://grouplens.org/datasets/movielens/) | 用户评分行为 | GroupLens 学术使用条款 | ❌ |
| [TMDb API](https://developer.themoviedb.org/) | 海报与多语言信息 | TMDb API Terms | ❌ |
| 个人观影记录 | 个人数据资产 | — | — |

⚠️ **本项目仅用于学习、求职作品集与个人爱好展示，不作任何商业用途。**

## 🚀 快速启动

```bash
# 启动全部基础设施
docker-compose -f infra/docker-compose.yml up -d

# 运行离线 ETL
cd etl && ./run_etl.sh

# 启动 Kafka 事件模拟器
python streaming/kafka-producer/event_replay.py

# 启动 Flink 实时作业
python streaming/flink-jobs/realtime_metrics.py
```

## 📈 项目进度

- [ ] Phase 0: 环境与项目骨架
- [ ] Phase 1: 数据探查与前端 MVP
- [ ] Phase 2: 离线数仓建设
- [ ] Phase 3: 实时数仓 + OLAP
- [ ] Phase 4: 文档与展示打磨

## 📚 关键技术点

- 维度建模（星型模型）+ 拉链表 SCD2 处理内容元数据缓慢变化
- 数据倾斜处理：热门内容场景下的 Key 加盐两阶段聚合
- Lambda 架构：离线全量 + 实时增量结合
- Flink Watermark + 侧输出流处理乱序与迟到事件
- ClickHouse 物化视图加速高频看板查询

## 📝 License

代码部分：MIT  
数据部分：遵循各自数据源协议（详见上方"数据源声明"）

---
*项目作者：瞿嘉亿 · 西南大学软件工程 · 2026 数据工程方向*
