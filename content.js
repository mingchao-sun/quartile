(async () => {
  const lang = await getLang();
  // 作者名（用户在选项页设置，用于无 DOI 论文的标题校验）
  const { authorNames = [] } = await chrome.storage.local.get("authorNames");
  const T = (key, vars) => tr(lang, key, vars);

  const items = [...document.querySelectorAll('a[href*="/published_papers/"]')]
    .filter(a => /\/published_papers\/\d+$/.test(new URL(a.href).pathname))
    .map(a => ({ a, li: a.closest("li") }))
    .filter(({ li }) => li && !li.dataset.rmMetrics);

  for (const { a, li } of items) {
    li.dataset.rmMetrics = "1";
    const cite = addBadge(li, "…", "rm-badge");

    try {
      const title = a.textContent.trim();
      const doi = await getDoi(a.href);
      // 年份取自标题以外的文字，避免标题里的年份干扰
      const rest = li.textContent.replace(title, "");
      const year = Number(rest.match(/(19|20)\d{2}/)?.[0]) || null;

      const res = await chrome.runtime.sendMessage(
        doi ? { type: "getMetrics", doi }
            : { type: "getMetrics", title, year, names: authorNames }
      );
      if (!res) throw new Error("no response");

      // 论文被引用数
      if (res.error) cite.textContent = T("cite_err");
      else if (res.citations == null) cite.textContent = doi ? T("cite_none") : T("cite_nodoi");
      else cite.textContent = `${T("cite_ok")} ${res.citations}${res.isOA ? " · " + T("cite_oa") : ""}`;
      if (res.venue) cite.title = res.venue;

      // OpenAlex 的 2 年平均被引（不是 JCR IF）
      const j = res.journal;
      if (j && j.twoYrMeanCitedness != null) {
        const jb = addBadge(li, `${T("tw_label")} ${j.twoYrMeanCitedness.toFixed(1)}`, "rm-badge rm-journal");
        jb.title =
          `${j.name ?? res.venue ?? ""}\n` +
          `${T("tw_tip")}\n` +
          `${T("h_index")}: ${j.hIndex ?? "—"}` +
          (j.doaj ? `\n${T("doaj")}` : "");
      }

      // 用户选择的 ShowJCR 数据表
      for (const t of res.tables ?? []) {
        const b = addBadge(li, `${t.short} ${t.text}`, "rm-badge rm-tbl");
        if (t.bg) b.style.background = t.bg;
        if (t.fg) b.style.color = t.fg;
        b.title = t.id;
      }
    } catch {
      cite.textContent = T("cite_err");
    }
    await new Promise(r => setTimeout(r, 300)); // 控制请求频率
  }

  function addBadge(li, text, cls) {
    const b = document.createElement("span");
    b.className = cls;
    b.textContent = text;
    li.appendChild(b);
    return b;
  }

  async function getDoi(url) {
    const html = await (await fetch(url, { credentials: "same-origin" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const link = doc.querySelector('a[href*="doi.org/"]');
    return link ? link.href.replace(/^https?:\/\/(dx\.)?doi\.org\//, "") : null;
  }
})();
