/**
 * Import Bible promise verses (Samuel Clarke PBP + 圣经应许合本) into Jinju Day.
 *
 * Usage:
 *   node scripts/import-promises.mjs
 *
 * Sources (priority order):
 *   1) scripts/promises-clarke-utf8.txt  (local UTF-8 extract)
 *   2) GitHub public-domain PBP CUVs mirror if local missing
 *   3) scripts/promises-cuv-utf8.txt     (圣经应许合本 UTF-8 extract)
 *   Optional Word/COM paths via env:
 *     CLARKE_DOCX, CUV_DOC
 *
 * Writes (never wipes existing seed):
 *   src/data/verses-cuv-seed.json
 *   scripts/promises-additions.json  (this run's newly added only)
 *   docs/IMPORT_PROMISES_REPORT.md
 *
 * Also prints suggested TOPIC_BY_REFERENCE stubs for new refs.
 */
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const docsDir = path.join(root, "docs");
const seedPath = path.join(dataDir, "verses-cuv-seed.json");
const clarkeLocal = path.join(__dirname, "promises-clarke-utf8.txt");
const cuvLocal = path.join(__dirname, "promises-cuv-utf8.txt");
const additionsPath = path.join(__dirname, "promises-additions.json");
const reportPath = path.join(docsDir, "IMPORT_PROMISES_REPORT.md");

const PBP_GITHUB =
  "https://raw.githubusercontent.com/eliranwong/Precious-Bible-Promises/master/other-bible-versions/PBP_verses_CUVs.txt";

/** Cap new additions per run (image-app friendly). 0 = unlimited after quality filters. */
const MAX_NEW = Number(process.env.MAX_NEW || 250);

const BOOK_MAP = {
  创: { book: "创世记", bookEn: "Genesis" },
  创世记: { book: "创世记", bookEn: "Genesis" },
  出: { book: "出埃及记", bookEn: "Exodus" },
  出埃及记: { book: "出埃及记", bookEn: "Exodus" },
  利: { book: "利未记", bookEn: "Leviticus" },
  利未记: { book: "利未记", bookEn: "Leviticus" },
  民: { book: "民数记", bookEn: "Numbers" },
  民数记: { book: "民数记", bookEn: "Numbers" },
  申: { book: "申命记", bookEn: "Deuteronomy" },
  申命记: { book: "申命记", bookEn: "Deuteronomy" },
  书: { book: "约书亚记", bookEn: "Joshua" },
  约书亚记: { book: "约书亚记", bookEn: "Joshua" },
  士: { book: "士师记", bookEn: "Judges" },
  士师记: { book: "士师记", bookEn: "Judges" },
  得: { book: "路得记", bookEn: "Ruth" },
  路得记: { book: "路得记", bookEn: "Ruth" },
  撒上: { book: "撒母耳记上", bookEn: "1 Samuel" },
  撒母耳记上: { book: "撒母耳记上", bookEn: "1 Samuel" },
  撒下: { book: "撒母耳记下", bookEn: "2 Samuel" },
  撒母耳记下: { book: "撒母耳记下", bookEn: "2 Samuel" },
  王上: { book: "列王纪上", bookEn: "1 Kings" },
  列王纪上: { book: "列王纪上", bookEn: "1 Kings" },
  王下: { book: "列王纪下", bookEn: "2 Kings" },
  列王纪下: { book: "列王纪下", bookEn: "2 Kings" },
  代上: { book: "历代志上", bookEn: "1 Chronicles" },
  历代志上: { book: "历代志上", bookEn: "1 Chronicles" },
  代下: { book: "历代志下", bookEn: "2 Chronicles" },
  历代志下: { book: "历代志下", bookEn: "2 Chronicles" },
  拉: { book: "以斯拉记", bookEn: "Ezra" },
  以斯拉记: { book: "以斯拉记", bookEn: "Ezra" },
  尼: { book: "尼希米记", bookEn: "Nehemiah" },
  尼希米记: { book: "尼希米记", bookEn: "Nehemiah" },
  斯: { book: "以斯帖记", bookEn: "Esther" },
  以斯帖记: { book: "以斯帖记", bookEn: "Esther" },
  伯: { book: "约伯记", bookEn: "Job" },
  约伯记: { book: "约伯记", bookEn: "Job" },
  诗: { book: "诗篇", bookEn: "Psalm" },
  诗篇: { book: "诗篇", bookEn: "Psalm" },
  箴: { book: "箴言", bookEn: "Proverbs" },
  箴言: { book: "箴言", bookEn: "Proverbs" },
  传: { book: "传道书", bookEn: "Ecclesiastes" },
  传道书: { book: "传道书", bookEn: "Ecclesiastes" },
  歌: { book: "雅歌", bookEn: "Song of Solomon" },
  雅歌: { book: "雅歌", bookEn: "Song of Solomon" },
  赛: { book: "以赛亚书", bookEn: "Isaiah" },
  塞: { book: "以赛亚书", bookEn: "Isaiah" },
  以赛亚书: { book: "以赛亚书", bookEn: "Isaiah" },
  耶: { book: "耶利米书", bookEn: "Jeremiah" },
  耶利米书: { book: "耶利米书", bookEn: "Jeremiah" },
  哀: { book: "耶利米哀歌", bookEn: "Lamentations" },
  耶利米哀歌: { book: "耶利米哀歌", bookEn: "Lamentations" },
  结: { book: "以西结书", bookEn: "Ezekiel" },
  以西结书: { book: "以西结书", bookEn: "Ezekiel" },
  但: { book: "但以理书", bookEn: "Daniel" },
  但以理书: { book: "但以理书", bookEn: "Daniel" },
  何: { book: "何西阿书", bookEn: "Hosea" },
  何西阿书: { book: "何西阿书", bookEn: "Hosea" },
  珥: { book: "约珥书", bookEn: "Joel" },
  约珥书: { book: "约珥书", bookEn: "Joel" },
  摩: { book: "阿摩司书", bookEn: "Amos" },
  阿摩司书: { book: "阿摩司书", bookEn: "Amos" },
  俄: { book: "俄巴底亚书", bookEn: "Obadiah" },
  俄巴底亚书: { book: "俄巴底亚书", bookEn: "Obadiah" },
  拿: { book: "约拿书", bookEn: "Jonah" },
  约拿书: { book: "约拿书", bookEn: "Jonah" },
  弥: { book: "弥迦书", bookEn: "Micah" },
  弥迦书: { book: "弥迦书", bookEn: "Micah" },
  鸿: { book: "那鸿书", bookEn: "Nahum" },
  那鸿书: { book: "那鸿书", bookEn: "Nahum" },
  哈: { book: "哈巴谷书", bookEn: "Habakkuk" },
  哈巴谷书: { book: "哈巴谷书", bookEn: "Habakkuk" },
  番: { book: "西番雅书", bookEn: "Zephaniah" },
  西番雅书: { book: "西番雅书", bookEn: "Zephaniah" },
  该: { book: "哈该书", bookEn: "Haggai" },
  哈该书: { book: "哈该书", bookEn: "Haggai" },
  亚: { book: "撒迦利亚书", bookEn: "Zechariah" },
  撒迦利亚书: { book: "撒迦利亚书", bookEn: "Zechariah" },
  玛: { book: "玛拉基书", bookEn: "Malachi" },
  玛拉基书: { book: "玛拉基书", bookEn: "Malachi" },
  太: { book: "马太福音", bookEn: "Matthew" },
  马太福音: { book: "马太福音", bookEn: "Matthew" },
  可: { book: "马可福音", bookEn: "Mark" },
  马可福音: { book: "马可福音", bookEn: "Mark" },
  路: { book: "路加福音", bookEn: "Luke" },
  路加福音: { book: "路加福音", bookEn: "Luke" },
  约: { book: "约翰福音", bookEn: "John" },
  约翰福音: { book: "约翰福音", bookEn: "John" },
  徒: { book: "使徒行传", bookEn: "Acts" },
  使徒行传: { book: "使徒行传", bookEn: "Acts" },
  罗: { book: "罗马书", bookEn: "Romans" },
  罗马书: { book: "罗马书", bookEn: "Romans" },
  林前: { book: "哥林多前书", bookEn: "1 Corinthians" },
  哥林多前书: { book: "哥林多前书", bookEn: "1 Corinthians" },
  林后: { book: "哥林多后书", bookEn: "2 Corinthians" },
  哥林多后书: { book: "哥林多后书", bookEn: "2 Corinthians" },
  加: { book: "加拉太书", bookEn: "Galatians" },
  加拉太书: { book: "加拉太书", bookEn: "Galatians" },
  弗: { book: "以弗所书", bookEn: "Ephesians" },
  以弗所书: { book: "以弗所书", bookEn: "Ephesians" },
  腓: { book: "腓立比书", bookEn: "Philippians" },
  腓立比书: { book: "腓立比书", bookEn: "Philippians" },
  西: { book: "歌罗西书", bookEn: "Colossians" },
  歌罗西书: { book: "歌罗西书", bookEn: "Colossians" },
  帖前: { book: "帖撒罗尼迦前书", bookEn: "1 Thessalonians" },
  帖撒罗尼迦前书: { book: "帖撒罗尼迦前书", bookEn: "1 Thessalonians" },
  帖后: { book: "帖撒罗尼迦后书", bookEn: "2 Thessalonians" },
  帖撒罗尼迦后书: { book: "帖撒罗尼迦后书", bookEn: "2 Thessalonians" },
  提前: { book: "提摩太前书", bookEn: "1 Timothy" },
  提摩太前书: { book: "提摩太前书", bookEn: "1 Timothy" },
  提后: { book: "提摩太后书", bookEn: "2 Timothy" },
  提摩太后书: { book: "提摩太后书", bookEn: "2 Timothy" },
  多: { book: "提多书", bookEn: "Titus" },
  提多书: { book: "提多书", bookEn: "Titus" },
  门: { book: "腓利门书", bookEn: "Philemon" },
  腓利门书: { book: "腓利门书", bookEn: "Philemon" },
  来: { book: "希伯来书", bookEn: "Hebrews" },
  希伯来书: { book: "希伯来书", bookEn: "Hebrews" },
  雅: { book: "雅各书", bookEn: "James" },
  雅各书: { book: "雅各书", bookEn: "James" },
  彼前: { book: "彼得前书", bookEn: "1 Peter" },
  彼得前书: { book: "彼得前书", bookEn: "1 Peter" },
  彼后: { book: "彼得后书", bookEn: "2 Peter" },
  彼得后书: { book: "彼得后书", bookEn: "2 Peter" },
  约壹: { book: "约翰一书", bookEn: "1 John" },
  约一: { book: "约翰一书", bookEn: "1 John" },
  约翰一书: { book: "约翰一书", bookEn: "1 John" },
  约贰: { book: "约翰二书", bookEn: "2 John" },
  约二: { book: "约翰二书", bookEn: "2 John" },
  约翰二书: { book: "约翰二书", bookEn: "2 John" },
  约叁: { book: "约翰三书", bookEn: "3 John" },
  约三: { book: "约翰三书", bookEn: "3 John" },
  约翰三书: { book: "约翰三书", bookEn: "3 John" },
  犹: { book: "犹大书", bookEn: "Jude" },
  犹大书: { book: "犹大书", bookEn: "Jude" },
  启: { book: "启示录", bookEn: "Revelation" },
  启示录: { book: "启示录", bookEn: "Revelation" },
};

const ABBR_KEYS = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchText(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function cleanText(t) {
  return t
    .replace(/上帝/g, "神")
    .replace(/〔注：[^〕]*〕/g, "")
    .replace(/〔[^〕]*〕/g, "")
    .replace(/（细拉）/g, "")
    .replace(/【[^】]*】/g, "")
    .replace(/交讬/g, "交托")
    .replace(/怀搋/g, "怀搋")
    .replace(/巖石/g, "岩石")
    .replace(/你诜过/g, "你趟过")
    .replace(/\s+/g, " ")
    .replace(/[。.\s]+$/u, "")
    .replace(/^「+|」+$/g, "")
    .trim();
}

function resolveBook(abbrRaw) {
  let abbr = abbrRaw.replace(/塞/g, "赛").replace(/\s+/g, "").trim();
  if (BOOK_MAP[abbr]) return BOOK_MAP[abbr];
  const key = ABBR_KEYS.find((k) => abbr.startsWith(k) || abbr.includes(k));
  return key ? BOOK_MAP[key] : null;
}

/** PBP line: （诗 84:11）\ttext  or  （约一 1:9）text */
function parsePbpLine(line) {
  const raw = line.trim();
  if (!raw || raw.startsWith("＊") || raw.startsWith("*")) return null;
  const m = raw.match(
    /^[（(]\s*([^\d）)\s]+)\s*(\d+)\s*[:：]\s*(\d+)(?:\s*[-–—~～]\s*(\d+))?\s*[）)]\s*(.+)$/s,
  );
  if (!m) return { fail: raw.slice(0, 120) };
  const [, abbr, ch, vs, ve, textRaw] = m;
  // skip placeholder-only lines like 〔13～14〕
  if (/^〔?\d+\s*[～~-]+\s*\d+〕?$/.test(textRaw.trim())) return null;
  const meta = resolveBook(abbr);
  if (!meta) return { fail: raw.slice(0, 120), reason: `unknown abbr ${abbr}` };
  const text = cleanText(textRaw);
  if (!text || text.length < 6) return null;
  // skip pure English
  if (!/[\u4e00-\u9fff]/.test(text)) return null;
  const chapter = Number(ch);
  const verseStart = Number(vs);
  let verseEnd = ve ? Number(ve) : undefined;
  if (verseEnd && verseEnd - verseStart > 3) {
    // multi-verse too long for image card → first verse only
    verseEnd = undefined;
  }
  const reference =
    verseEnd && verseEnd !== verseStart
      ? `${meta.book} ${chapter}:${verseStart}-${verseEnd}`
      : `${meta.book} ${chapter}:${verseStart}`;
  const out = {
    book: meta.book,
    bookEn: meta.bookEn,
    chapter,
    verseStart,
    text,
    reference,
  };
  if (verseEnd && verseEnd !== verseStart) out.verseEnd = verseEnd;
  return out;
}

/** Generic Chinese patterns: text（约翰福音 14:27） or text 诗篇 23:1 */
function parseGenericLine(line) {
  const raw = line.replace(/^\s*\d+[\.、．)\s]+/, "").trim();
  if (!raw) return null;
  let m = raw.match(
    /^(.+?)[。.]?\s*[（(]\s*([^\d）)\s]+?)\s*(\d+)\s*[:：]\s*(\d+)(?:\s*[-–—~～]\s*(\d+))?\s*[）)]\s*$/,
  );
  if (!m) {
    m = raw.match(
      /^(.+?)\s+([^\d\s]{1,12})\s*(\d+)\s*[:：]\s*(\d+)(?:\s*[-–—~～]\s*(\d+))?\s*$/,
    );
  }
  if (!m) return { fail: raw.slice(0, 120) };
  let [, text, abbr, ch, vs, ve] = m;
  text = cleanText(text);
  if (!text || !/[\u4e00-\u9fff]/.test(text)) return null;
  const meta = resolveBook(abbr);
  if (!meta) return { fail: raw.slice(0, 120), reason: `unknown abbr ${abbr}` };
  const chapter = Number(ch);
  const verseStart = Number(vs);
  let verseEnd = ve ? Number(ve) : undefined;
  if (verseEnd && verseEnd - verseStart > 3) verseEnd = undefined;
  const reference =
    verseEnd && verseEnd !== verseStart
      ? `${meta.book} ${chapter}:${verseStart}-${verseEnd}`
      : `${meta.book} ${chapter}:${verseStart}`;
  const out = {
    book: meta.book,
    bookEn: meta.bookEn,
    chapter,
    verseStart,
    text,
    reference,
  };
  if (verseEnd && verseEnd !== verseStart) out.verseEnd = verseEnd;
  return out;
}

function parseSourceText(text, mode = "pbp") {
  const verses = [];
  const fails = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const r = mode === "pbp" ? parsePbpLine(line) : parseGenericLine(line);
    if (!r) continue;
    if (r.fail) {
      fails.push(r);
      continue;
    }
    // quality: skip very long cards
    if (r.text.length > 180) continue;
    verses.push(r);
  }
  return { verses, fails };
}

function scoreVerse(v) {
  // prefer short-medium image-friendly promise language
  let s = 0;
  const t = v.text;
  if (t.length >= 12 && t.length <= 90) s += 3;
  else if (t.length <= 140) s += 1;
  if (/必|不要|我是|慈爱|平安|拯救|安慰|同在|信|盼望|恩典|力量|帮助/.test(t)) s += 2;
  if (/杀|灭绝|刀剑|咒诅|忿怒|报应|灾/.test(t) && !/必不|不再|不要/.test(t)) s -= 1;
  return s;
}

function dedupeByRef(list) {
  const m = new Map();
  for (const v of list) {
    const prev = m.get(v.reference);
    if (!prev || scoreVerse(v) > scoreVerse(prev) || v.text.length < prev.text.length) {
      m.set(v.reference, v);
    }
  }
  return [...m.values()];
}

function mergeVerses(existing, incoming) {
  const byRef = new Map(existing.map((v) => [v.reference, v]));
  const added = [];
  let skipped = 0;
  // sort by score desc for cap
  const ranked = [...incoming].sort((a, b) => scoreVerse(b) - scoreVerse(a));
  for (const v of ranked) {
    if (byRef.has(v.reference)) {
      skipped++;
      continue;
    }
    if (MAX_NEW > 0 && added.length >= MAX_NEW) break;
    byRef.set(v.reference, v);
    added.push(v);
  }
  return { list: [...byRef.values()], added, skipped };
}

function topicHints(v) {
  const tags = [];
  const t = v.text;
  if (/平安|安息|不要忧愁|不要胆怯|安然/.test(t)) tags.push("peace");
  if (/喜乐|欢喜|快乐|欢呼/.test(t)) tags.push("joy");
  if (/盼望|指望|等候/.test(t)) tags.push("hope");
  if (/信实|诚实|不落空|不改变|必成就/.test(t)) tags.push("faithfulness");
  if (/信|倚靠|仰赖/.test(t)) tags.push("faith");
  if (/仁爱|慈爱|爱你|爱我们|神爱|爱我/.test(t)) tags.push("love");
  if (/怜悯|恩慈|恩待|怜恤/.test(t)) tags.push("kindness");
  if (/良善|美善/.test(t)) tags.push("goodness");
  if (/温柔|柔和|谦卑/.test(t)) tags.push("gentleness");
  if (/忍耐|恒久|耐心/.test(t)) tags.push("patience");
  if (/节制|谨守|自制|警醒/.test(t)) tags.push("self_control");
  if (/力量|刚强|坚固|帮助|能力/.test(t)) tags.push("strength");
  if (/智慧|聪明|教训|训言/.test(t)) tags.push("wisdom");
  if (/感谢|称谢|恩典|赏赐/.test(t)) tags.push("gratitude");
  if (/同在|与你同在|牧者|避难所|不离弃|不撇下/.test(t)) tags.push("presence");
  if (/救|永生|得救|赎|赦/.test(t)) tags.push("salvation");
  if (/安慰|擦去|顾念|卸给|扶持/.test(t)) tags.push("comfort");
  if (tags.length === 0) tags.push("presence");
  return [...new Set(tags)].slice(0, 4);
}

async function loadClarke() {
  if (fs.existsSync(clarkeLocal)) {
    const text = fs.readFileSync(clarkeLocal, "utf8");
    return { text, source: clarkeLocal };
  }
  console.log("Local clarke UTF-8 missing; fetching GitHub PBP CUVs…");
  const text = await fetchText(PBP_GITHUB);
  fs.writeFileSync(clarkeLocal, text, "utf8");
  return { text, source: `github:${PBP_GITHUB}` };
}

function loadCuvOptional() {
  if (!fs.existsSync(cuvLocal)) {
    return { text: "", source: "(missing)", verses: [], fails: [] };
  }
  const text = fs.readFileSync(cuvLocal, "utf8");
  // auto-detect PBP style vs generic
  const pbpHits = (text.match(/^（/gm) || []).length;
  const mode = pbpHits > 10 ? "pbp" : "generic";
  const { verses, fails } = parseSourceText(text, mode);
  return { text, source: cuvLocal, verses, fails, mode };
}

async function main() {
  const existing = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const before = existing.length;

  const clarke = await loadClarke();
  const clarkeParsed = parseSourceText(clarke.text, "pbp");
  const cuv = loadCuvOptional();

  const fromClarke = dedupeByRef(clarkeParsed.verses);
  const fromCuv = dedupeByRef(cuv.verses || []);

  // tag source for report
  const clarkeRefs = new Set(fromClarke.map((v) => v.reference));
  const cuvRefs = new Set(fromCuv.map((v) => v.reference));

  const combined = dedupeByRef([...fromClarke, ...fromCuv]);
  const { list, added, skipped } = mergeVerses(existing, combined);

  fs.writeFileSync(seedPath, JSON.stringify(list, null, 2) + "\n", "utf8");
  fs.writeFileSync(additionsPath, JSON.stringify(added, null, 2) + "\n", "utf8");

  let addedClarke = 0;
  let addedCuv = 0;
  for (const v of added) {
    if (clarkeRefs.has(v.reference)) addedClarke++;
    else if (cuvRefs.has(v.reference)) addedCuv++;
  }

  const samples = added.slice(0, 10);
  const topicLines = added
    .slice(0, 80)
    .map((v) => {
      const topics = topicHints(v)
        .map((t) => `"${t}"`)
        .join(", ");
      return `  "${v.reference}": [${topics}],`;
    })
    .join("\n");

  const failures = [
    ...clarkeParsed.fails.slice(0, 20).map((f) => `clarke: ${f.reason || "parse"} | ${f.fail}`),
    ...(cuv.fails || []).slice(0, 20).map((f) => `cuv: ${f.reason || "parse"} | ${f.fail}`),
  ];

  const report = `# 圣经应许导入报告

生成时间：${new Date().toISOString().slice(0, 10)}（scripts/import-promises.mjs）

## 来源

| 源 | 路径 / URL | 解析条数 |
|----|------------|----------|
| 克拉克《珍贵的圣经应许》PBP CUV 简体 | ${clarke.source} | ${fromClarke.length} unique refs（raw lines parsed ${clarkeParsed.verses.length}） |
| 圣经应许合本 | ${cuv.source} | ${fromCuv.length} unique |

> 本地 Word 原文（Downloads 下 .docx / .doc）若需抽取：先修好 Grok shell 硬链接后运行本脚本；亦可用 Word COM / pandoc 写入 \`scripts/promises-*-utf8.txt\`。

## 金句池 \`src/data/verses-cuv-seed.json\`

| 指标 | 数量 |
|------|------|
| 导入前 | **${before}** |
| 候选 unique（两源合并） | **${combined.length}** |
| 与已有 reference 重复跳过 | **${skipped}** |
| **本次新增**（cap MAX_NEW=${MAX_NEW}） | **${added.length}** |
| 其中约来自 Clarke/PBP | **${addedClarke}** |
| 其中约来自 应许合本 | **${addedCuv}** |
| 导入后 | **${list.length}** |

### 新增样本（10）

| reference | text（节选） |
|-----------|----------------|
${samples.map((v) => `| ${v.reference} | ${v.text.slice(0, 48)}${v.text.length > 48 ? "…" : ""} |`).join("\n")}

### 规范

- 优先和合本用语；PBP 源中「上帝」规范为「神」以贴合既有 seed。
- 清理〔注〕、细拉、过长 multi-verse（>3 节取首节）。
- 不删除任何既有金句；按 \`reference\` 去重。
- 质量：长度 6–180 字；偏好短中篇应许用语。

## 失败 / 限制

${failures.length ? failures.map((f) => `- ${f}`).join("\n") : "- 无严重解析失败（或仅占位行已跳过）"}
- Agent shell 若缺少 \`%USERPROFILE%\\.grok\\bin\\powershell.exe\` 硬链接，无法现场 Word COM 抽 .doc；请双击 \`FIX-GROK-SHELL-THEN-BUILD.cmd\` 或：
  \`mklink /H "%USERPROFILE%\\.grok\\bin\\powershell.exe" "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe"\`

## 主题标签建议（可粘贴进 topics.ts）

\`\`\`ts
  // 应许导入批次
${topicLines}
\`\`\`

## 重跑

\`\`\`bat
cd /d C:\\Users\\holyx\\jinju-ri
node scripts\\import-promises.mjs
\`\`\`

环境变量：\`MAX_NEW=0\` 取消新增上限。
`;

  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");

  console.log(
    JSON.stringify(
      {
        before,
        after: list.length,
        added: added.length,
        addedClarke,
        addedCuv,
        skipped,
        samples: samples.map((s) => s.reference),
      },
      null,
      2,
    ),
  );
  console.log("Suggested TOPIC lines:\n" + topicLines.slice(0, 2000));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
