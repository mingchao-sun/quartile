// ShowJCR 数据表定义与解析（background 和 options 共用）

const SHOWJCR_BASE =
  "https://raw.githubusercontent.com/hitfyd/ShowJCR/master/" +
  encodeURIComponent("中科院分区表及JCR原始数据文件") + "/";

const TABLES = [
  { id: "jcr2025",  grp: "grp_jcr", year: "2025", sh: "sh_jcr", file: "JCR2025-UTF8.csv", kind: "jcr", bg: "#dbeafe", fg: "#1e40af" },
  { id: "jcr2024",  grp: "grp_jcr", year: "2024", sh: "sh_jcr", file: "JCR2024-UTF8.csv", kind: "jcr", bg: "#e0f2fe", fg: "#075985" },
  { id: "fqb2025",  grp: "grp_cas", year: "2025", sh: "sh_cas", file: "FQBJCR2025-UTF8.csv", kind: "fqb", bg: "#fee2e2", fg: "#991b1b" },
  { id: "fqb2023",  grp: "grp_cas", year: "2023", sh: "sh_cas", file: "FQBJCR2023-UTF8.csv", kind: "fqb", bg: "#ffe4e6", fg: "#be123c" },
  { id: "fqb2022",  grp: "grp_cas", year: "2022", sh: "sh_cas", file: "FQBJCR2022-UTF8.csv", kind: "fqb", bg: "#fce7f3", fg: "#9d174d" },
  { id: "fqb2021",  grp: "grp_cas", year: "2021", sh: "sh_cas", file: "FQBJCR2021-UTF8.csv", kind: "fqb", bg: "#ffedd5", fg: "#9a3412" },
  { id: "xr2026",   grp: "grp_xr", labelKey: "tbl_xr26", year: "2026", sh: "sh_xr", file: "XR2026-UTF8.csv", kind: "xr", bg: "#ccfbf1", fg: "#115e59" },
  { id: "ccf2026",  grp: "grp_ccf", labelKey: "tbl_ccf26", year: "2026", sh: "sh_ccf", file: "CCF2026-UTF8.csv", kind: "ccf", bg: "#ede9fe", fg: "#5b21b6" },
  { id: "ccft2025", grp: "grp_ccf", labelKey: "tbl_ccft25", year: "2025", sh: "sh_ccft", file: "CCFT2025-UTF8.csv", kind: "ccft", bg: "#f3e8ff", fg: "#6b21a8" },
  { id: "warn2020", grp: "grp_warn", year: "2020", sh: "sh_warn", file: "GJQKYJMD2020.csv", kind: "warn", bg: "#f5f5f4", fg: "#57534e" },
  { id: "warn2021", grp: "grp_warn", year: "2021", sh: "sh_warn", file: "GJQKYJMD2021.csv", kind: "warn", bg: "#e5e7eb", fg: "#374151" },
  { id: "warn2023", grp: "grp_warn", year: "2023", sh: "sh_warn", file: "GJQKYJMD2023.csv", kind: "warn", bg: "#dcfce7", fg: "#166534" },
  { id: "warn2024", grp: "grp_warn", year: "2024", sh: "sh_warn", file: "GJQKYJMD2024.csv", kind: "warn", bg: "#ecfccb", fg: "#3f6212" },
  { id: "warn2025", grp: "grp_warn", year: "2025", sh: "sh_warn", file: "GJQKYJMD2025.csv", kind: "warn", bg: "#fef9c3", fg: "#854d0e" }
];

// 表的显示名称与短标签（随语言变化）
function tableLabel(t, lang) {
  return t.labelKey ? tr(lang, t.labelKey) : `${tr(lang, t.grp)} ${t.year}`;
}
function tableShort(t, lang) {
  return tr(lang, t.sh) + t.year.slice(2);
}

// 通用 CSV 解析（支持引号、CRLF、BOM）
function parseCSV(text) {
  text = text.replace(/^﻿/, "");
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') {
      q = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (!(row.length === 1 && row[0] === "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.map(r => r.map(s => s.trim()));
}

const normIssn = s => (s || "").replace(/[^0-9Xx]/g, "").toUpperCase();
const normName = s => (s || "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

// 每种表的解析规则：根据表头找列，返回 row => 展示文本 | null
const SPEC = {
  // JCR：IF(年份) 与 IF Quartile(年份)_1..N，取最好的分区
  jcr: H => {
    const ifi = H.findIndex(h => /^IF\(\d{4}\)$/.test(h));
    const qCols = H.map((h, i) => (/^IF Quartile\(\d{4}\)(_\d+)?$/.test(h) ? i : -1)).filter(i => i >= 0);
    return r => {
      const parts = [];
      const v = ifi >= 0 ? parseFloat(r[ifi]) : NaN;
      if (!isNaN(v)) parts.push(`IF ${v.toFixed(1)}`);
      const q = qCols.map(i => (r[i] || "").toUpperCase()).filter(x => /^Q[1-4]$/.test(x)).sort()[0];
      if (q) parts.push(q);
      return parts.length ? parts.join(" · ") : null;
    };
  },
  // 中科院分区：大类 + 大类分区 (+ Top)
  fqb: H => {
    const cat = H.indexOf("大类"), catQ = H.indexOf("大类分区"), top = H.indexOf("Top");
    return r => {
      if (cat < 0 || catQ < 0 || !r[cat] || !r[catQ]) return null;
      const level = (r[catQ].match(/^\d+/) || [])[0]; // 2025 版形如 "4 [625/778]"，只取前面的数字
      if (!level) return null;
      const isTop = top >= 0 && r[top] === "是";
      return `${r[cat]} ${level}区${isTop ? " · Top" : ""}`;
    };
  },
  // 新锐分区（XR）：大类中文名 + 大类新锐分区
  xr: H => {
    const cat = H.indexOf("大类中文名"), q = H.indexOf("大类新锐分区");
    return r => (q >= 0 && r[q] ? [cat >= 0 ? r[cat] : "", r[q]].filter(Boolean).join(" ") : null);
  },
  // CCF 推荐目录：CCF推荐类型（A/B/C）
  ccf: H => {
    const t = H.findIndex(h => /^CCF推荐类型/.test(h));
    return r => (t >= 0 && r[t] ? r[t] : null);
  },
  // CCF T 分区
  ccft: H => {
    const t = H.findIndex(h => /^T分区/.test(h));
    return r => (t >= 0 && r[t] ? r[t] : null);
  },
  // 预警名单：预警原因 / 预警等级 列
  warn: H => {
    const w = H.findIndex(h => /^预警/.test(h));
    return r => (w >= 0 && r[w] ? r[w] : null);
  }
};

// 构建两个索引：byIssn（ISSN/EISSN）与 byName（期刊英文名，标准化后）
function buildTable(kind, text) {
  const rows = parseCSV(text);
  const H = rows[0] || [];
  const describe = SPEC[kind](H);
  const nameI = H.findIndex(h => /^journal$/i.test(h));
  const issnIdx = H.map((h, i) => (/issn/i.test(h) ? i : -1)).filter(i => i >= 0); // 兼容 ISSN、EISSN、ISSN/EISSN
  const byIssn = {}, byName = {};
  for (const r of rows.slice(1)) {
    const d = describe(r);
    if (!d) continue;
    for (const i of issnIdx) {
      for (const part of String(r[i] || "").split(/[\/,;\s]+/)) {
        const k = normIssn(part);
        if (k.length === 8 && !(k in byIssn)) byIssn[k] = d;
      }
    }
    if (nameI >= 0) {
      const k = normName(r[nameI]);
      if (k && !(k in byName)) byName[k] = d;
    }
  }
  return { byIssn, byName };
}

// 先按 ISSN 匹配，失败再按期刊名精确匹配（标准化后）
function lookupTable(tbl, issns, name) {
  for (const s of issns) {
    const k = normIssn(s);
    if (k && tbl.byIssn[k]) return tbl.byIssn[k];
  }
  const k = normName(name);
  return (k && tbl.byName[k]) || null;
}
