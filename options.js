let lang = "zh";
const $ = id => document.getElementById(id);

function applyStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = tr(lang, el.dataset.i18n);
  });
}

function namesStatus(names) {
  $("names_out").textContent = names.length
    ? tr(lang, "names_saved", { n: names.length })
    : tr(lang, "names_none");
}

function renderList(enabled) {
  const box = $("list");
  box.innerHTML = "";
  const groups = {};
  for (const t of TABLES) (groups[t.grp] ??= []).push(t);

  for (const [g, list] of Object.entries(groups)) {
    const h = document.createElement("h3");
    h.textContent = tr(lang, g);
    box.appendChild(h);
    for (const t of list) {
      const lab = document.createElement("label");
      lab.className = "row";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = t.id;
      cb.checked = enabled.has(t.id);
      lab.append(cb, " " + tableLabel(t, lang));
      box.appendChild(lab);
    }
  }
}

async function init() {
  const { enabledTables, lang: saved, authorNames } = await chrome.storage.local.get(["enabledTables", "lang", "authorNames"]);
  lang = I18N[saved] ? saved : "zh";
  $("lang").value = lang;
  applyStatic();
  const names = Array.isArray(authorNames) ? authorNames : [];
  $("names").value = names.join(", ");
  namesStatus(names);
  renderList(new Set(Array.isArray(enabledTables) ? enabledTables : ["jcr2025"]));
  $("out").textContent = tr(lang, "opt_apply");
}

$("lang").addEventListener("change", async e => {
  lang = e.target.value;
  await chrome.storage.local.set({ lang });
  applyStatic();
  const enabled = new Set([...document.querySelectorAll("#list input:checked")].map(i => i.value));
  renderList(enabled);
  $("out").textContent = tr(lang, "opt_apply");
});

$("names").addEventListener("change", async e => {
  const names = e.target.value.split(/[,，\n]/).map(s => s.trim()).filter(Boolean);
  await chrome.storage.local.set({ authorNames: names });
  namesStatus(names);
});

$("list").addEventListener("change", async () => {
  const ids = [...document.querySelectorAll("#list input:checked")].map(i => i.value);
  await chrome.storage.local.set({ enabledTables: ids });
  $("out").textContent = tr(lang, "opt_selected", { n: ids.length });
});

$("clear").addEventListener("click", async () => {
  const all = await chrome.storage.local.get(null);
  const keys = Object.keys(all).filter(k => k.startsWith("tbl2:"));
  await chrome.storage.local.remove(keys);
  $("out").textContent = tr(lang, "opt_cleared", { n: keys.length });
});

init();
