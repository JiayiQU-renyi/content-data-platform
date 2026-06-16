# 数据源说明

本目录用于存放或链接到本项目使用的所有数据源。**所有数据均为合法、免费、可公开使用的资源**，本项目仅用于个人学习与求职作品集展示，不作任何商业用途。

## 数据源清单

### 1. IMDb Non-Commercial Datasets

- **官网**：https://developer.imdb.com/non-commercial-datasets/
- **下载地址**：https://datasets.imdbws.com/
- **协议**：CC BY-NC 4.0（非商业使用授权）
- **包含文件**：
  - `title.basics.tsv.gz` ：影片基础信息（标题、年份、类型）
  - `title.ratings.tsv.gz` ：IMDb 评分与投票数
  - `title.crew.tsv.gz` ：导演与编剧
  - `title.principals.tsv.gz` ：主创人员
  - `name.basics.tsv.gz` ：人物基础信息

### 2. MovieLens 25M

- **官网**：https://grouplens.org/datasets/movielens/
- **下载地址**：https://files.grouplens.org/datasets/movielens/ml-25m.zip
- **协议**：仅供学术与个人非商业使用
- **包含文件**：
  - `ratings.csv` ：2500万条用户评分（含 userId, movieId, rating, timestamp）
  - `movies.csv` ：电影信息
  - `tags.csv` ：用户标签
  - `links.csv` ：与 IMDb / TMDb 的 ID 映射

### 3. TMDb API

- **官网**：https://developer.themoviedb.org/
- **使用方式**：注册账号申请 API Key
- **协议**：TMDb API Terms of Use
- **用途**：本项目仅用于获取海报、剧情简介等展示用素材

### 4. 个人观影记录

存放于 `data/personal/` 目录，是项目作者多年来的个人观影记录，作为本平台个性化模块的真实数据源。

---

## 数据下载与放置

数据文件较大（合计约 1.5 GB），不进入 Git 仓库。请按以下步骤本地下载：

```bash
# 1. IMDb 数据
mkdir -p data/raw/imdb
cd data/raw/imdb
wget https://datasets.imdbws.com/title.basics.tsv.gz
wget https://datasets.imdbws.com/title.ratings.tsv.gz
wget https://datasets.imdbws.com/title.crew.tsv.gz
wget https://datasets.imdbws.com/title.principals.tsv.gz
wget https://datasets.imdbws.com/name.basics.tsv.gz

# 2. MovieLens 25M
cd ../../
mkdir -p data/raw/movielens
cd data/raw/movielens
wget https://files.grouplens.org/datasets/movielens/ml-25m.zip
unzip ml-25m.zip
```

---

## 引用与致谢

- IMDb data is provided by IMDb.com, Inc. for non-commercial use
- MovieLens data is provided by GroupLens Research at the University of Minnesota
- TMDb data is provided by The Movie Database

> This product uses the TMDb API but is not endorsed or certified by TMDb.
