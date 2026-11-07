# Quartile

Journal and citation metrics shown beside papers on [researchmap](https://researchmap.jp).

- Citation counts from [OpenAlex](https://openalex.org), with DOI lookup and a guarded title-search fallback.
- OpenAlex 2-year mean citedness and h-index for each journal.
- Optional journal tables, selected in the options page and fetched online from [hitfyd/ShowJCR](https://github.com/hitfyd/ShowJCR):
  - JCR Impact Factor and Quartile (2024, 2025)
  - CAS journal partitions (2021–2023, 2025)
  - XR journal ranking (2026)
  - CCF recommended list (2026) and CCF T-grade (2025)
  - International warning lists (2020, 2021, 2023, 2024, 2025)
- Interface in 中文, 日本語 and English.

**Quartile is an unofficial tool. It is not affiliated with researchmap, JST, Clarivate, OpenAlex or the data publishers.**

## Install (developer mode)

1. Clone or download this repository.
2. Open `chrome://extensions`, enable *Developer mode*, click *Load unpacked*, and select the folder.
3. Open **Options** from the extension's menu. Choose a language, enter your author names, and tick the tables you want.
4. Reload any researchmap researcher page.

## Author names

Title matching for papers without a DOI needs the names as they appear in OpenAlex, separated by commas (for example `Taro Yamada, 山田太郎`). If the field is empty, those papers are not matched by title, which avoids showing another author's metrics.

## Data sources and licensing

- The extension does not contain any journal ranking data. Tables are downloaded at runtime from ShowJCR and cached for 30 days.
- ShowJCR states that its data comes from third parties (Clarivate JCR, CAS journal partitions, xr-scholar.com, fenqubiao.com, the CCF website). Check those terms before redistributing the data or publishing a build that bundles it.
- The extension code is MIT-licensed (see `LICENSE`).

## Development

```sh
node tests/unit.js
```

The tests cover CSV parsing, identifier normalisation, matching, quartile selection and title similarity. They need no network access.

## Privacy

See [PRIVACY.md](PRIVACY.md). Nothing is sent to the developer.
