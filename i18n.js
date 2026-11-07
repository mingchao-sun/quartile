// 界面文字：中文 / 日本語 / English（用户在选项页中选择）
const I18N = {
  zh: {
    names_label: "作者名（用于匹配无 DOI 的论文）",
    names_help: "用逗号分隔，填写 OpenAlex 中显示的名字，例如 Taro Yamada, 山田太郎。未填写时，无 DOI 的论文不做标题检索。",
    names_saved: "已保存 {n} 个作者名。刷新页面生效。",
    names_none: "未设置作者名：无 DOI 的论文将不做标题检索。",
    lang_label: "语言",
    opt_title: "显示的数据表",
    opt_intro: "勾选后，论文旁会显示对应数据表的标签。数据在线读取自 hitfyd/ShowJCR，首次使用时下载，缓存 30 天。",
    opt_apply: "勾选的表会在刷新 researchmap 页面后生效。",
    opt_selected: "已选择 {n} 个数据表。刷新 researchmap 页面生效。",
    opt_clear: "清除数据表缓存",
    opt_cleared: "已清除 {n} 个数据表缓存，下次访问时会重新下载。",
    grp_jcr: "JCR 影响因子与分区",
    grp_cas: "中科院分区",
    grp_xr: "新锐分区",
    grp_ccf: "CCF",
    grp_warn: "国际预警名单",
    tbl_xr26: "新锐分区 2026（XR2026）",
    tbl_ccf26: "CCF 推荐目录 2026",
    tbl_ccft25: "CCF 高质量期刊分级 T 分区 2025",
    sh_jcr: "JCR",
    sh_cas: "中科院",
    sh_xr: "新锐",
    sh_ccf: "CCF",
    sh_ccft: "CCF-T",
    sh_warn: "预警",
    cite_ok: "被引用",
    cite_oa: "OA",
    cite_none: "未收录",
    cite_nodoi: "无DOI·未收录",
    cite_err: "获取失败",
    tw_label: "2年平均被引",
    tw_tip: "OpenAlex 的 2 年平均被引（不是 JCR 的 IF）",
    h_index: "h-index",
    doaj: "DOAJ 收录（OA 期刊）"
  },
  ja: {
    names_label: "著者名（DOIのない論文の照合用）",
    names_help: "カンマ区切りで、OpenAlex に表示される名前を入力してください（例: Taro Yamada, 山田太郎）。未入力の場合、DOIのない論文は題名検索を行いません。",
    names_saved: "{n} 件の著者名を保存しました。ページを再読み込みすると反映されます。",
    names_none: "著者名が未設定のため、DOIのない論文は題名検索を行いません。",
    lang_label: "言語",
    opt_title: "表示するデータ表",
    opt_intro: "チェックした表のラベルが論文の横に表示されます。データは hitfyd/ShowJCR からオンラインで読み込まれ、初回使用時にダウンロードされ、30日間キャッシュされます。",
    opt_apply: "チェックの変更は researchmap ページを再読み込みすると反映されます。",
    opt_selected: "{n} 件のデータ表を選択しました。researchmap ページを再読み込みすると反映されます。",
    opt_clear: "データ表のキャッシュを消去",
    opt_cleared: "{n} 件のデータ表キャッシュを消去しました。次回アクセス時に再ダウンロードされます。",
    grp_jcr: "JCR インパクトファクター・分区",
    grp_cas: "中国科学院分区",
    grp_xr: "新鋭ランキング",
    grp_ccf: "CCF",
    grp_warn: "国際警告リスト",
    tbl_xr26: "新鋭ランキング 2026（XR2026）",
    tbl_ccf26: "CCF 推奨リスト 2026",
    tbl_ccft25: "CCF 高品質ジャーナル分級（T分区）2025",
    sh_jcr: "JCR",
    sh_cas: "中国科学院",
    sh_xr: "新鋭",
    sh_ccf: "CCF",
    sh_ccft: "CCF-T",
    sh_warn: "警告",
    cite_ok: "被引用数",
    cite_oa: "OA",
    cite_none: "未収録",
    cite_nodoi: "DOIなし・未収録",
    cite_err: "取得失敗",
    tw_label: "2年平均被引用数",
    tw_tip: "OpenAlex の 2年平均被引用数（JCR の IF ではありません）",
    h_index: "h-index",
    doaj: "DOAJ 収録（OA誌）"
  },
  en: {
    names_label: "Author names (to match papers without a DOI)",
    names_help: "Comma-separated, as they appear in OpenAlex (e.g. Taro Yamada, 山田太郎). If empty, papers without a DOI are not matched by title.",
    names_saved: "Saved {n} author name(s). Reload the page to apply.",
    names_none: "No author names set: papers without a DOI are not matched by title.",
    lang_label: "Language",
    opt_title: "Data tables to show",
    opt_intro: "Checked tables add labels next to each paper. Data is loaded online from hitfyd/ShowJCR, downloaded on first use and cached for 30 days.",
    opt_apply: "Changes take effect after you reload the researchmap page.",
    opt_selected: "{n} table(s) selected. Reload the researchmap page to apply.",
    opt_clear: "Clear table cache",
    opt_cleared: "Cleared {n} cached table(s). They will be downloaded again on the next visit.",
    grp_jcr: "JCR Impact Factor & Quartile",
    grp_cas: "CAS Journal Ranking",
    grp_xr: "XR Journal Ranking",
    grp_ccf: "CCF",
    grp_warn: "International Warning List",
    tbl_xr26: "XR Ranking 2026 (XR2026)",
    tbl_ccf26: "CCF Recommended List 2026",
    tbl_ccft25: "CCF High-Quality Journal Grading (T) 2025",
    sh_jcr: "JCR",
    sh_cas: "CAS",
    sh_xr: "XR",
    sh_ccf: "CCF",
    sh_ccft: "CCF-T",
    sh_warn: "Warn",
    cite_ok: "Cited",
    cite_oa: "OA",
    cite_none: "Not indexed",
    cite_nodoi: "No DOI · not indexed",
    cite_err: "Error",
    tw_label: "2-yr mean citedness",
    tw_tip: "OpenAlex 2-year mean citedness (not the JCR IF)",
    h_index: "h-index",
    doaj: "DOAJ-indexed (open access)"
  }
};

// 取文字，支持 {变量} 替换；缺失时回退到中文
function tr(lang, key, vars) {
  const dict = I18N[lang] || I18N.zh;
  let s = dict[key] ?? I18N.zh[key] ?? key;
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

// 读取用户选择的语言（默认中文）
async function getLang() {
  try {
    const { lang } = await chrome.storage.local.get("lang");
    return I18N[lang] ? lang : "zh";
  } catch {
    return "zh";
  }
}
