# Chrome Web Store listing — Quartile

## Name
Quartile

## Summary (max 132 characters)

- **English:** Show citation counts, journal metrics and JCR, CAS, CCF and warning-list labels beside papers on researchmap.
- **日本語:** researchmap の論文一覧に被引用数・雑誌指標と、JCR・中国科学院分区・CCF・警告リストのラベルを表示します。
- **中文:** 在 researchmap 论文列表旁显示被引用数、期刊指标，以及 JCR、中科院分区、CCF、预警名单等标签。

## Detailed description (English)

Quartile adds journal and citation information next to each paper on researchmap researcher pages.

- Citation counts from OpenAlex, matched by DOI. Papers without a DOI can be matched by title, using the author names you enter.
- OpenAlex 2-year mean citedness and h-index for each journal.
- Optional journal tables, chosen in the options page: JCR Impact Factor and Quartile (2024, 2025), CAS journal partitions (2021–2023, 2025), XR ranking (2026), CCF recommended list (2026), CCF T-grade (2025), and international warning lists (2020–2025).
- Interface in English, 日本語 and 中文.

Tables are downloaded from the public ShowJCR repository on GitHub the first time they are enabled, and cached for 30 days. Quartile does not bundle any ranking data.

Quartile is an unofficial tool. It is not affiliated with researchmap, JST, Clarivate, OpenAlex, the CAS, or the CCF.

## Single purpose

Display journal and citation metrics for papers listed on researchmap.

## Permission justifications

| Permission / host | Why it is needed |
|---|---|
| `storage` | Save the language, enabled tables, author names and cached results on the device. |
| `unlimitedStorage` | The cached journal tables are several megabytes when many are enabled. |
| `https://researchmap.jp/*` | Read the paper list on researcher pages and show labels beside each paper. |
| `https://api.openalex.org/*` | Look up citation counts and journal metrics for each paper. |
| `https://raw.githubusercontent.com/*` | Download the public CSV journal tables from the ShowJCR repository. |

## Data handling (for the developer declarations)

- Collects no personal data. Author names are stored only on the device and are never sent anywhere.
- Sends only paper DOIs or titles, publication years and journal ISSNs to OpenAlex.
- Does not sell data, does not use it for advertising or creditworthiness, and does not transfer it to third parties beyond the requests above.
- Does not execute remote code. Downloaded files are data (CSV), parsed locally.

## Privacy policy URL

Host `PRIVACY.md` from the GitHub repository and paste its URL here: `<PRIVACY_POLICY_URL>`

## Store graphics

- Icon 128×128: `icons/icon128.png` (provided)
- Small promo tile 440×280: `store/promo-440x280.png` (provided)
- Screenshots 1280×800 (1–5 required): **must be taken from the real extension in Chrome**. Suggested set:
  1. A researcher page with citation and JCR labels beside papers.
  2. Options page: table selection.
  3. Options page in 日本語.
  4. Options page in English, showing author names.
  5. A paper with CCF or warning-list labels.
- Optional marquee 1400×560: not yet created.

## Before submitting

1. Fill in the copyright holder in `LICENSE`.
2. Confirm the name "Quartile" is free in the Chrome Web Store, and check for trademark conflicts.
3. Test every language and at least one table of each type on a real researcher page.
4. Publish the GitHub repository and use its `PRIVACY.md` URL.
5. Pay the one-time developer registration fee and upload the ZIP of the extension folder (without `tests/`, `store/`, `.gitignore`, `README.md`).
