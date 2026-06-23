/* ============================================================
   Content Data Platform — Main JS
   - Loads all ADS JSON files
   - Renders 4 ECharts visualizations
   - Populates top movies list
   - Handles responsive resize
   ============================================================ */

// Design tokens, mirrored in JS for chart colors
const COLORS = {
    blue: '#1B4D7A',
    blueLight: '#3A77AD',
    blueFaint: '#E8F0F7',
    green: '#5A8A7C',
    greenFaint: '#E8F1EE',
    accent: '#C97B5D',
    ink1: '#0B1929',
    ink3: '#5A6B7C',
    ink4: '#98A4B3',
    line: '#E5EAEF',
    bgCard: '#FFFFFF'
};

// ECharts shared text styling
const TEXT_STYLE = {
    fontFamily: '"Inter", -apple-system, "PingFang SC", sans-serif',
    color: COLORS.ink3,
    fontSize: 12
};

const TOOLTIP_BASE = {
    trigger: 'axis',
    backgroundColor: COLORS.ink1,
    borderWidth: 0,
    padding: [10, 14],
    textStyle: {
        color: '#fff',
        fontFamily: '"Inter", sans-serif',
        fontSize: 12
    },
    axisPointer: {
        type: 'line',
        lineStyle: { color: COLORS.ink4, type: 'dashed' }
    }
};

const AXIS_BASE = {
    axisLine: { lineStyle: { color: COLORS.line } },
    axisTick: { show: false },
    axisLabel: { color: COLORS.ink3, fontSize: 11, fontFamily: '"JetBrains Mono", monospace' },
    splitLine: { lineStyle: { color: COLORS.line, type: 'solid' } }
};

// ----- Utility -----
async function loadJSON(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${path}`);
        return await res.json();
    } catch (e) {
        console.error('Failed to load', path, e);
        return null;
    }
}

function formatNumber(n) {
    return new Intl.NumberFormat('en-US').format(n);
}

// ----- Chart 1: DAU monthly trend (line chart) -----
async function renderDAUChart() {
    const data = await loadJSON('./data/dau_monthly.json');
    if (!data) return;

    // Sort by year_month
    data.sort((a, b) => a.year_month.localeCompare(b.year_month));

    const chart = echarts.init(document.getElementById('chart-dau'));

    chart.setOption({
        textStyle: TEXT_STYLE,
        grid: { left: 60, right: 30, top: 30, bottom: 40 },
        tooltip: {
            ...TOOLTIP_BASE,
            formatter: (params) => {
                const p = params[0];
                return `<div style="font-family:Inter Tight,sans-serif;font-size:14px;margin-bottom:4px">${p.axisValue}</div>
                        <div style="color:${COLORS.blueLight}">${formatNumber(p.value)} active users</div>`;
            }
        },
        xAxis: {
            ...AXIS_BASE,
            type: 'category',
            data: data.map(d => d.year_month),
            axisLabel: {
                ...AXIS_BASE.axisLabel,
                interval: Math.floor(data.length / 8)
            }
        },
        yAxis: {
            ...AXIS_BASE,
            type: 'value',
            axisLine: { show: false },
            axisLabel: {
                ...AXIS_BASE.axisLabel,
                formatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
            }
        },
        series: [{
            type: 'line',
            data: data.map(d => d.mau),
            smooth: true,
            symbol: 'none',
            lineStyle: { color: COLORS.blue, width: 2 },
            areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: 'rgba(27, 77, 122, 0.15)' },
                    { offset: 1, color: 'rgba(27, 77, 122, 0)' }
                ])
            }
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// ----- Chart 2: User funnel (horizontal bar) -----
async function renderFunnelChart() {
    const data = await loadJSON('./data/user_funnel.json');
    if (!data) return;

    data.sort((a, b) => a.step - b.step);

    const chart = echarts.init(document.getElementById('chart-funnel'));

    chart.setOption({
        textStyle: TEXT_STYLE,
        grid: { left: 130, right: 70, top: 20, bottom: 30 },
        tooltip: {
            ...TOOLTIP_BASE,
            trigger: 'item',
            formatter: (p) => {
                const d = p.data;
                return `<div style="font-family:Inter Tight;font-size:14px;margin-bottom:4px">${d.stage.replace(/^\d_/, '')}</div>
                        <div>${formatNumber(d.value)} users (${d.overall_pct}%)</div>
                        ${d.step_conv_rate ? `<div style="color:${COLORS.ink4};margin-top:4px">↳ ${d.step_conv_rate}% vs previous</div>` : ''}`;
            }
        },
        xAxis: {
            ...AXIS_BASE,
            type: 'value',
            axisLine: { show: false },
            axisLabel: {
                ...AXIS_BASE.axisLabel,
                formatter: (v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
            }
        },
        yAxis: {
            ...AXIS_BASE,
            type: 'category',
            data: data.map(d => d.stage.replace(/^\d_/, '')),
            axisLine: { show: false },
            splitLine: { show: false },
            inverse: false
        },
        series: [{
            type: 'bar',
            data: data.map(d => ({
                value: d.user_count,
                stage: d.stage,
                overall_pct: d.overall_pct,
                step_conv_rate: d.step_conv_rate,
                itemStyle: { color: COLORS.blue, borderRadius: [0, 2, 2, 0] }
            })),
            barWidth: '60%',
            label: {
                show: true,
                position: 'right',
                color: COLORS.ink3,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                formatter: (p) => formatNumber(p.value)
            }
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// ----- Chart 3: Cohort retention heatmap -----
async function renderRetentionChart() {
    const data = await loadJSON('./data/user_retention.json');
    if (!data) return;

    // Build matrix
    const cohortYears = [...new Set(data.map(d => d.cohort_year))].sort();
    const yearOffsets = [...new Set(data.map(d => d.year_offset))].sort((a, b) => a - b);

    const matrix = [];
    data.forEach(d => {
        const x = yearOffsets.indexOf(d.year_offset);
        const y = cohortYears.indexOf(d.cohort_year);
        matrix.push([x, y, d.retention_pct]);
    });

    const chart = echarts.init(document.getElementById('chart-retention'));

    chart.setOption({
        textStyle: TEXT_STYLE,
        grid: { left: 70, right: 80, top: 30, bottom: 40 },
        tooltip: {
            ...TOOLTIP_BASE,
            trigger: 'item',
            formatter: (p) => {
                const cohort = cohortYears[p.value[1]];
                const offset = yearOffsets[p.value[0]];
                return `<div>Cohort ${cohort}</div>
                        <div style="font-family:Inter Tight;font-size:14px;margin:4px 0">Year +${offset}</div>
                        <div style="color:${COLORS.accent}">${p.value[2]}% retained</div>`;
            }
        },
        xAxis: {
            ...AXIS_BASE,
            type: 'category',
            data: yearOffsets.map(o => `Y+${o}`),
            axisLine: { show: false },
            splitLine: { show: false }
        },
        yAxis: {
            ...AXIS_BASE,
            type: 'category',
            data: cohortYears,
            axisLine: { show: false },
            splitLine: { show: false }
        },
        visualMap: {
            min: 0,
            max: 100,
            calculable: false,
            orient: 'vertical',
            right: 0,
            top: 'center',
            itemHeight: 200,
            itemWidth: 8,
            inRange: { color: [COLORS.blueFaint, COLORS.blueLight, COLORS.blue, COLORS.ink1] },
            textStyle: { color: COLORS.ink3, fontFamily: '"JetBrains Mono", monospace', fontSize: 10 }
        },
        series: [{
            type: 'heatmap',
            data: matrix,
            label: {
                show: true,
                color: COLORS.ink1,
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 10,
                formatter: (p) => `${p.value[2]}`
            },
            itemStyle: { borderWidth: 2, borderColor: COLORS.bgCard }
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// ----- Chart 4: Genre popularity (treemap-style stacked bar) -----
async function renderGenreChart() {
    const data = await loadJSON('./data/genre_popularity.json');
    if (!data) return;

    // Get top genres overall by total rating_count
    const genreTotals = {};
    data.forEach(d => {
        genreTotals[d.genre] = (genreTotals[d.genre] || 0) + d.rating_count;
    });
    const topGenres = Object.entries(genreTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([g]) => g);

    // Filter to top genres only, sum across eras
    const filtered = data.filter(d => topGenres.includes(d.genre));

    // Average rating per genre
    const genreAvg = {};
    topGenres.forEach(g => {
        const rows = filtered.filter(d => d.genre === g);
        const total = rows.reduce((s, r) => s + r.rating_count, 0);
        const weighted = rows.reduce((s, r) => s + r.avg_rating * r.rating_count, 0);
        genreAvg[g] = { count: total, avg: weighted / total };
    });

    const sortedGenres = topGenres.sort((a, b) => genreAvg[b].count - genreAvg[a].count);

    const chart = echarts.init(document.getElementById('chart-genre'));

    chart.setOption({
        textStyle: TEXT_STYLE,
        grid: { left: 100, right: 60, top: 20, bottom: 30 },
        tooltip: {
            ...TOOLTIP_BASE,
            trigger: 'item',
            formatter: (p) => {
                const g = p.name;
                const info = genreAvg[g];
                return `<div style="font-family:Inter Tight;font-size:14px;margin-bottom:4px">${g}</div>
                        <div>${formatNumber(info.count)} ratings</div>
                        <div style="color:${COLORS.accent}">${info.avg.toFixed(2)} avg score</div>`;
            }
        },
        xAxis: {
            ...AXIS_BASE,
            type: 'value',
            axisLine: { show: false },
            axisLabel: {
                ...AXIS_BASE.axisLabel,
                formatter: (v) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}k` : v
            }
        },
        yAxis: {
            ...AXIS_BASE,
            type: 'category',
            data: sortedGenres.reverse(),
            axisLine: { show: false },
            splitLine: { show: false }
        },
        series: [{
            type: 'bar',
            data: sortedGenres.map(g => ({
                value: genreAvg[g].count,
                name: g,
                itemStyle: {
                    color: COLORS.green,
                    borderRadius: [0, 2, 2, 0]
                }
            })),
            barWidth: '70%'
        }]
    });

    window.addEventListener('resize', () => chart.resize());
}

// ----- Top movies list -----
async function renderTopMovies() {
    const data = await loadJSON('./data/top_movies.json');
    if (!data) return;

    const container = document.getElementById('top-movies-list');
    container.innerHTML = '';

    data.slice(0, 20).forEach(m => {
        const item = document.createElement('div');
        item.className = 'top-item';
        item.innerHTML = `
            <div class="top-rank">${String(m.overall_rank).padStart(2, '0')}</div>
            <div class="top-info">
                <div class="top-title">${m.title || 'Untitled'}</div>
                <div class="top-meta">${m.release_year || '—'} · ${m.era || ''} · ${(m.genres || '').split(',').slice(0, 2).join(' · ')}</div>
            </div>
            <div class="top-stats">
                <div class="top-stat-value">${m.ml_avg_rating ? m.ml_avg_rating.toFixed(1) : '—'}</div>
                <div class="top-stat-label">avg / ${formatNumber(m.ml_rating_count || 0)}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

// ----- KPI counters (animated count-up) -----
function animateCounter(el, target) {
    const duration = 1200;
    const start = performance.now();
    const isInt = Number.isInteger(target);

    function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = isInt
            ? formatNumber(Math.floor(current))
            : current.toFixed(1);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = formatNumber(target);
    }
    requestAnimationFrame(tick);
}

async function loadKPIs() {
    // 静态 KPI 直接从 HTML 取数据
    // 也可以通过加载 JSON 自动计算,这里先用 HTML 里写的硬编码值
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(el => {
        const target = parseInt(el.textContent.replace(/,/g, ''), 10);
        if (!isNaN(target)) {
            // Reset display, then animate
            el.textContent = '0';
            // Stagger the animations
            setTimeout(() => animateCounter(el, target), Math.random() * 200);
        }
    });
}

// ----- Init -----
document.addEventListener('DOMContentLoaded', () => {
    // Animate KPIs immediately
    loadKPIs();

    // Load all charts in parallel
    renderDAUChart();
    renderFunnelChart();
    renderRetentionChart();
    renderGenreChart();
    renderTopMovies();
});
