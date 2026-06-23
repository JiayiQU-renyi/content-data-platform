# Content Data Platform · 内容评价数据平台

> 基于真实公开数据集（IMDb + MovieLens）+ 个人观影记录,构建的端到端内容数据平台,覆盖埋点采集 → ETL 加工 → 数仓建模 → OLAP 分析 → 前端可视化全链路。

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=flat-square)](https://jiayiqu-renyi.github.io/content-data-platform/)
[![Stack](https://img.shields.io/badge/stack-PySpark%20·%20ClickHouse%20·%20Flink-blue?style=flat-square)]()
[![Data License](https://img.shields.io/badge/data-CC%20BY--NC%204.0-lightgrey?style=flat-square)]()

🌐 **Live Demo** → [https://jiayiqu-renyi.github.io/content-data-platform/](https://jiayiqu-renyi.github.io/content-data-platform/)

---

## 项目背景

这不是一个普通的 SaaS dashboard,而是一份关于"**注意力如何在十年间形成审美**"的数据档案。

技术上,它覆盖了一个完整数据工程项目应有的全部链路:从原始数据接入、数仓四层建模、OLAP 查询加速、再到前端可视化。
内容上,它融合了 IMDb 1000 万部影视作品、MovieLens 2500 万条真实用户评分,以及作者本人多年来的观影记录。

## 技术架构

\`\`\`
                    前端展示层 (HTML/CSS/JS + ECharts)
                              ↑ JSON
            ┌─────────────────┴─────────────────┐
            ↑                                   ↑
       ClickHouse (OLAP)                  静态指标 JSON
            ↑                                   ↑
            │                                   │
        Flink                          Spark + Hive Metastore
       (实时数仓)                          (离线数仓)
            ↑                                   ↑
            │                                   │
        Kafka                              HDFS / Parquet
       (事件总线)                         (Hive 风格分区)
            ↑                                   ↑
            └───────────────┬───────────────────┘
                            │
        IMDb + MovieLens 25M + 个人观影记录 + TMDb API
\`\`\`

## 数仓分层

| 层级 | 含义 | 本项目内容 |
|---|---|---|
| **ODS** | 原始数据层 | 5 张原始表,从 CSV/TSV 转 Parquet,体积压缩 10x |
| **DWD** | 明细数据层 | `dim_movie` 维度表 + `fact_user_rating` 按年分区事实表 |
| **DWS** | 汇总数据层 | `dws_user_daily`、`dws_movie_daily`、`dws_user_profile` |
| **ADS** | 应用数据层 | 5 张面向看板的指标表(DAU 趋势/Top 榜/留存/类型热度/漏斗) |

## 技术栈

| 类别 | 技术选型 | 选型理由 |
|---|---|---|
| **离线计算** | PySpark + Spark SQL | 业界主流,性能优于 Hive on MR,SQL 兼容 |
| **存储格式** | Parquet + Hive 风格分区 | 列存压缩 + 分区裁剪,大幅提升查询性能 |
| **OLAP** | ClickHouse (MergeTree) | 多维分析查询性能行业领先 |
| **实时流** | Kafka + Flink | 业界标准的实时数仓组合 |
| **前端** | HTML/CSS/JS + ECharts | 零构建,轻量,百度系生态匹配 |
| **部署** | GitHub Pages + GitHub Actions | 自动化 CI/CD |

## 项目亮点

- 🏗️ **完整四层数仓** — 不是只有数据清洗,从 ODS 一路建到 ADS,模拟真实生产环境
- ⏱️ **Hive 风格分区** — `fact_user_rating` 按年分区,分区裁剪查询提速 N 倍
- 📊 **5 张面向业务的 ADS 表** — Cohort 留存矩阵、参与度漏斗、内容热度榜等
- 🎬 **Editorial 设计语言** — 不走 SaaS 模板,以个人作品的姿态呈现
- 📚 **个人观影评价板块** — 10 部塑造作者审美的作品,展示批评者视角
- 🔒 **数据合规** — 全部使用合法公开数据集,清晰声明各源协议

## 数据源声明

本项目仅用于个人学习与求职作品集展示,不作任何商业用途。

| 数据源 | 内容 | 协议 |
|---|---|---|
| [IMDb Non-Commercial Datasets](https://developer.imdb.com/non-commercial-datasets/) | 影视元数据 | CC BY-NC 4.0 |
| [MovieLens 25M](https://grouplens.org/datasets/movielens/) | 2500 万条用户评分 | GroupLens 学术使用条款 |
| [TMDb API](https://developer.themoviedb.org/) | 海报与多语言信息 | TMDb API Terms |
| 个人观影记录 | 个人多年来的观影笔记 | — |

> This product uses the TMDb API but is not endorsed or certified by TMDb.

## 项目结构

\`\`\`
content-data-platform/
├── .github/workflows/    # GitHub Actions CI/CD
├── docs/                 # 设计文档与架构图
├── data/                 # 数据源说明与个人数据
├── notebooks/            # 数据探索与 ETL Jupyter Notebooks
│   ├── 01_data_exploration.ipynb
│   ├── 02_sql_training.ipynb
│   ├── 03_pyspark_warehouse.ipynb  # ODS + DWD 层建设
│   └── 04_dws_ads_layers.ipynb     # DWS + ADS 层 + JSON 导出
├── etl/                  # SQL ETL 脚本(规划中)
├── streaming/            # Kafka + Flink 实时链路(规划中)
└── frontend/             # 静态网站
    ├── index.html
    ├── styles/main.css
    ├── scripts/main.js
    └── data/             # ADS 表导出的 JSON
\`\`\`

## 本地运行

\`\`\`bash
# 1. 克隆仓库
git clone https://github.com/JiayiQU-renyi/content-data-platform.git
cd content-data-platform

# 2. 创建 Python 虚拟环境
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. 下载原始数据(详见 data/README.md)

# 4. 跑 Notebooks 重建数据仓库
jupyter lab notebooks/

# 5. 本地预览前端
cd frontend
python3 -m http.server 8080
# 浏览器访问 http://localhost:8080
\`\`\`

## License

代码: MIT
数据: 遵循各数据源协议(详见上方"数据源声明")

---

**Author** · Jiayi Qu (瞿嘉亿) · [GitHub](https://github.com/JiayiQU-renyi) · 西南大学软件工程 · 2026 数据工程方向