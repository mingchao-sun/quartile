const fs = require("fs"), vm = require("vm"), path = require("path");
const CODE = path.join(__dirname, "..");
const ctx = { console, URL, Set, Map, Date, JSON, Math, Object, Array, String, Number, RegExp, Error, Promise, setTimeout, chrome: { runtime: { onMessage: { addListener() {} } }, storage: { local: {} } }, fetch: async () => ({ json: async () => ({ results: [] }) }) };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(CODE + "/i18n.js", "utf8") + fs.readFileSync(CODE + "/tables.js", "utf8") + fs.readFileSync(CODE + "/background.js", "utf8").replace('importScripts("i18n.js", "tables.js");', ""), ctx);
let pass = 0, fail = 0;
const eq = (a, b, msg) => { const ok = JSON.stringify(a) === JSON.stringify(b); ok ? pass++ : fail++; console.log((ok ? "PASS " : "FAIL ") + msg + (ok ? "" : `  got=${JSON.stringify(a)} want=${JSON.stringify(b)}`)); };
const run = code => vm.runInContext(code, ctx);
// parseCSV
eq(run('parseCSV("a,b\\r\\n1,2\\r\\n")'), [["a","b"],["1","2"]], "CRLF line endings");
eq(run('parseCSV("\\uFEFFa,b\\n1,2")'), [["a","b"],["1","2"]], "BOM removed");
eq(run('parseCSV("x,\\"MEDICINE, GENERAL\\",\\"say \\"\\"hi\\"\\"\\"\\n")'), [["x","MEDICINE, GENERAL",'say "hi"']], "quoted comma and escaped quote");
eq(run('parseCSV("a,b\\n\\n1,2\\n\\n")'), [["a","b"],["1","2"]], "blank lines skipped");
// normalisation
eq(run('normIssn("2052-4463")'), "20524463", "ISSN hyphen removed");
eq(run('normIssn("0028-092x")'), "0028092X", "ISSN check digit X upper-cased");
eq(run('normName("Scientific Data.")'), "scientificdata", "name punctuation/case ignored");
eq(run('normName("ＡＢＣ  Journal")'), "abcjournal", "full-width letters normalised");
// jaccard / tokens
eq(run('jaccard("Impact of Using Social Networks on Wages", "Impact of Using Social Networks on Wages")') , 1, "identical titles -> 1");
eq(run('jaccard("German Job Mobility and Wages", "Immigrant Networks and Their Implications")') < 0.8, true, "unrelated titles below threshold");
console.log("INFO jaccard(CJK title, same title + subtitle) = " + run('jaccard("社会的ネットワークの効果", "社会的ネットワークの効果について")').toFixed(2) + " (threshold 0.8: subtitle variants are rejected)");
eq(run('jaccard("社会的ネットワークの効果", "社会的ネットワークの効果")'), 1, "identical CJK titles -> 1");
// lookupTable
const tbl = run('buildTable("jcr", "Journal,ISSN,eISSN,Category,IF(2024),IF Quartile(2024),IF Rank(2024)\\nFoo Journal,1111-2222,3333-4444,X,2.5,Q2,1/9\\n")');
eq(run('(function(){return lookupTable(' + JSON.stringify(tbl) + ', ["3333-4444"], null)})()'), "IF 2.5 · Q2", "lookup by eISSN");
eq(run('(function(){return lookupTable(' + JSON.stringify(tbl) + ', [], "FOO JOURNAL")})()'), "IF 2.5 · Q2", "lookup by name fallback");
eq(run('(function(){return lookupTable(' + JSON.stringify(tbl) + ', ["9999-9999"], "Other")})()'), null, "no match returns null");
// 2025 JCR with 2 categories picks best quartile
const t2 = run('buildTable("jcr", "Journal,ISSN,IF(2025),IF Quartile(2025)_1,IF Quartile(2025)_2\\nBar,1234-5678,4.0,Q3,Q1\\n")');
eq(run('(function(){return lookupTable(' + JSON.stringify(t2) + ', ["1234-5678"], null)})()'), "IF 4.0 · Q1", "best quartile across categories");
// fqb 2025 level extraction and Top
const t3 = run('buildTable("fqb", "Journal,年份,ISSN/EISSN,大类,大类分区,Top\\nBaz,2025,1111-1111/2222-2222,历史学,4 [625/778],是\\n")');
eq(run('(function(){return lookupTable(' + JSON.stringify(t3) + ', ["2222-2222"], null)})()'), "历史学 4区 · Top", "fqb 2025 '4 [625/778]' -> 4区, Top, EISSN match");
// title search returns null when OpenAlex has no results (no throw)
run('findByTitle("x y z", 2020, ["Mingchao Sun"])').then(v => { eq(v, null, "findByTitle returns null when no results"); console.log(`\n${pass} passed, ${fail} failed`); });
