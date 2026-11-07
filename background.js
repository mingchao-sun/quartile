importScripts("i18n.js", "tables.js");

const TTL = 30 * 24 * 3600 * 1000;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "getMetrics") return false;
  getMetrics(msg)
    .then(attachTables)
    .then(sendResponse)
    .catch(e => sendResponse({ error: String(e) }));
  return true;
});

// 论文被引用数（缓存）
async function getMetrics({ doi, title, year, names }) {
  const key = doi ? "oa2:" + doi : "ot2:" + title;
  const cached = (await chrome.storage.local.get(key))[key];
  if (cached && Date.now() - cached.t < TTL) return cached.data;

  let w = null;
  if (doi) {
    const r = await fetch(`https://api.openalex.org/works/doi:${doi}?select=cited_by_count,open_access,primary_location`);
    if (r.status !== 404) {
      if (!r.ok) throw new Error("OpenAlex " + r.status);
      w = await r.json();
    }
  } else {
    w = await findByTitle(title, year, names);
  }

  let data = { citations: null };
  if (w) {
    data = {
      citations: w.cited_by_count ?? null,
      isOA: w.open_access?.is_oa ?? false,
      venue: w.primary_location?.source?.display_name ?? null,
      journal: null
    };
    const sid = w.primary_location?.source?.id;
    if (sid) data.journal = await getSource(sid);
  }

  await chrome.storage.local.set({ [key]: { t: Date.now(), data } });
  return data;
}

// 期刊指标（OpenAlex 的 2 年平均被引，缓存）
async function getSource(sid) {
  const id = sid.split("/").pop();
  const key = "src2:" + id;
  const cached = (await chrome.storage.local.get(key))[key];
  if (cached && Date.now() - cached.t < TTL) return cached.data;

  const r = await fetch(`https://api.openalex.org/sources/${id}?select=display_name,summary_stats,is_in_doaj,issn,issn_l`);
  if (!r.ok) return null;
  const j = await r.json();
  const data = {
    name: j.display_name ?? null,
    twoYrMeanCitedness: j.summary_stats?.["2yr_mean_citedness"] ?? null,
    hIndex: j.summary_stats?.h_index ?? null,
    doaj: !!j.is_in_doaj,
    issns: [...new Set([j.issn_l, ...(j.issn ?? [])].filter(Boolean))]
  };
  await chrome.storage.local.set({ [key]: { t: Date.now(), data } });
  return data;
}

// 用户选择显示的数据表
async function enabledIds() {
  const { enabledTables } = await chrome.storage.local.get("enabledTables");
  return Array.isArray(enabledTables) ? enabledTables : ["jcr2025"];
}

// 数据表：下载 → 解析 → 缓存（每个表只下载一次，并发请求共享同一个 Promise）
const inflight = {};
async function loadTable(id) {
  const key = "tbl2:" + id;
  const cached = (await chrome.storage.local.get(key))[key];
  if (cached && Date.now() - cached.t < TTL) return cached.data;
  if (inflight[id]) return inflight[id];

  const meta = TABLES.find(t => t.id === id);
  inflight[id] = (async () => {
    const r = await fetch(SHOWJCR_BASE + meta.file);
    if (!r.ok) throw new Error(`${meta.file} ${r.status}`);
    const data = buildTable(meta.kind, await r.text());
    await chrome.storage.local.set({ [key]: { t: Date.now(), data } });
    return data;
  })().finally(() => { delete inflight[id]; });
  return inflight[id];
}

async function attachTables(res) {
  if (!res?.journal) return res;
  const ids = await enabledIds();
  const lang = await getLang();
  const results = await Promise.all(ids.map(async id => {
    const meta = TABLES.find(t => t.id === id);
    if (!meta) return null;
    try {
      const tbl = await loadTable(id);
      const text = lookupTable(tbl, res.journal.issns ?? [], res.journal.name);
      return text ? { id, short: tableShort(meta, lang), text, bg: meta.bg, fg: meta.fg } : null;
    } catch (e) {
      return null; // 某个表下载失败时不影响其他内容
    }
  }));
  res.tables = results.filter(Boolean);
  return res;
}

// 无 DOI 时按标题检索，并用年份、标题相似度、作者三重校验
async function findByTitle(title, year, names) {
  if (!names || names.length === 0) return null; // 未设置作者名时不做标题检索
  const url = "https://api.openalex.org/works?search=" + encodeURIComponent(title.slice(0, 200)) +
    "&per-page=5&select=title,publication_year,cited_by_count,open_access,primary_location,authorships";
  const j = await (await fetch(url)).json();
  const want = names.map(n => n.replace(/\s+/g, "").toLowerCase());

  for (const w of j.results || []) {
    if (year && Math.abs((w.publication_year || 0) - year) > 1) continue;
    if (jaccard(title, w.title || "") < 0.8) continue;
    const auth = (w.authorships || [])
      .map(a => (a.author?.display_name ?? "").replace(/\s+/g, "").toLowerCase())
      .filter(Boolean);
    if (!auth.some(n => want.includes(n))) continue;
    return w;
  }
  return null;
}

function tokens(s) {
  s = s.normalize("NFKC").toLowerCase();
  if (/[぀-ヿ一-鿿]/.test(s)) {
    const c = s.replace(/[^\p{L}\p{N}]/gu, "");
    const t = new Set();
    for (let i = 0; i < c.length - 1; i++) t.add(c.slice(i, i + 2));
    return t;
  }
  return new Set(s.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
}

function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  let inter = 0;
  A.forEach(x => B.has(x) && inter++);
  return inter / (A.size + B.size - inter || 1);
}
