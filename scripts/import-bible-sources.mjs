/**
 * Import gold verses + expand lectionary from local/UTF-8 sources.
 * Usage: node scripts/import-bible-sources.mjs
 *
 * Reads:
 *   scripts/gold500-utf8.txt  (UTF-8 CUV gold list; mirror of 圣经金句500句 GBK source)
 *   src/data/verses-cuv-seed.json
 *   src/data/lectionary-readings.json
 * Writes merged UTF-8 JSON (never wipes existing).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const docsDir = path.join(root, "docs");

const BOOK_MAP = {
  创: { book: "创世记", bookEn: "Genesis" },
  出: { book: "出埃及记", bookEn: "Exodus" },
  利: { book: "利未记", bookEn: "Leviticus" },
  民: { book: "民数记", bookEn: "Numbers" },
  申: { book: "申命记", bookEn: "Deuteronomy" },
  书: { book: "约书亚记", bookEn: "Joshua" },
  得: { book: "路得记", bookEn: "Ruth" },
  撒上: { book: "撒母耳记上", bookEn: "1 Samuel" },
  撒下: { book: "撒母耳记下", bookEn: "2 Samuel" },
  王上: { book: "列王纪上", bookEn: "1 Kings" },
  王下: { book: "列王纪下", bookEn: "2 Kings" },
  代上: { book: "历代志上", bookEn: "1 Chronicles" },
  尼: { book: "尼希米记", bookEn: "Nehemiah" },
  斯: { book: "以斯帖记", bookEn: "Esther" },
  伯: { book: "约伯记", bookEn: "Job" },
  诗: { book: "诗篇", bookEn: "Psalm" },
  箴: { book: "箴言", bookEn: "Proverbs" },
  传: { book: "传道书", bookEn: "Ecclesiastes" },
  赛: { book: "以赛亚书", bookEn: "Isaiah" },
  塞: { book: "以赛亚书", bookEn: "Isaiah" },
  耶: { book: "耶利米书", bookEn: "Jeremiah" },
  哀: { book: "耶利米哀歌", bookEn: "Lamentations" },
  结: { book: "以西结书", bookEn: "Ezekiel" },
  但: { book: "但以理书", bookEn: "Daniel" },
  何: { book: "何西阿书", bookEn: "Hosea" },
  珥: { book: "约珥书", bookEn: "Joel" },
  摩: { book: "阿摩司书", bookEn: "Amos" },
  拿: { book: "约拿书", bookEn: "Jonah" },
  弥: { book: "弥迦书", bookEn: "Micah" },
  哈: { book: "哈巴谷书", bookEn: "Habakkuk" },
  番: { book: "西番雅书", bookEn: "Zephaniah" },
  该: { book: "哈该书", bookEn: "Haggai" },
  亚: { book: "撒迦利亚书", bookEn: "Zechariah" },
  玛: { book: "玛拉基书", bookEn: "Malachi" },
  太: { book: "马太福音", bookEn: "Matthew" },
  可: { book: "马可福音", bookEn: "Mark" },
  路: { book: "路加福音", bookEn: "Luke" },
  约: { book: "约翰福音", bookEn: "John" },
  徒: { book: "使徒行传", bookEn: "Acts" },
  罗: { book: "罗马书", bookEn: "Romans" },
  林前: { book: "哥林多前书", bookEn: "1 Corinthians" },
  林后: { book: "哥林多后书", bookEn: "2 Corinthians" },
  加: { book: "加拉太书", bookEn: "Galatians" },
  弗: { book: "以弗所书", bookEn: "Ephesians" },
  腓: { book: "腓立比书", bookEn: "Philippians" },
  西: { book: "歌罗西书", bookEn: "Colossians" },
  帖前: { book: "帖撒罗尼迦前书", bookEn: "1 Thessalonians" },
  帖后: { book: "帖撒罗尼迦后书", bookEn: "2 Thessalonians" },
  提前: { book: "提摩太前书", bookEn: "1 Timothy" },
  提后: { book: "提摩太后书", bookEn: "2 Timothy" },
  多: { book: "提多书", bookEn: "Titus" },
  来: { book: "希伯来书", bookEn: "Hebrews" },
  雅: { book: "雅各书", bookEn: "James" },
  彼前: { book: "彼得前书", bookEn: "1 Peter" },
  彼后: { book: "彼得后书", bookEn: "2 Peter" },
  约壹: { book: "约翰一书", bookEn: "1 John" },
  约一: { book: "约翰一书", bookEn: "1 John" },
  犹: { book: "犹大书", bookEn: "Jude" },
  启: { book: "启示录", bookEn: "Revelation" },
};

const ABBR_KEYS = Object.keys(BOOK_MAP).sort((a, b) => b.length - a.length);

function parseLine(line) {
  const raw = line.replace(/^\s*\d+\s*/, "").trim();
  if (!raw) return null;
  // text.(abbr ch:vs) or text。(abbr ch:vs) or text（abbr ch:vs）
  const m = raw.match(
    /^(.+?)[。.]?\s*[（(]\s*([^\d\s）)]+?)\s*(\d+)\s*[:：]\s*(\d+)(?:\s*[-–—~]\s*(\d+))?\s*[上下]?\s*[）)]\s*$/
  );
  if (!m) return { fail: raw };
  let [, text, abbr, ch, vs, ve] = m;
  text = text
    .replace(/[。.\s]+$/, "")
    .replace(/伶恤/g, "怜恤")
    .replace(/不至缺乏/g, "不致缺乏")
    .trim();
  abbr = abbr.replace(/塞/g, "赛").trim();
  const meta = BOOK_MAP[abbr];
  if (!meta) {
    // try longest prefix match
    const key = ABBR_KEYS.find((k) => abbr.startsWith(k));
    if (!key) return { fail: raw, reason: `unknown abbr ${abbr}` };
    Object.assign(meta || {}, BOOK_MAP[key]);
  }
  const bookMeta = BOOK_MAP[abbr] || BOOK_MAP[ABBR_KEYS.find((k) => abbr.startsWith(k))];
  if (!bookMeta) return { fail: raw, reason: `unknown abbr ${abbr}` };
  const chapter = Number(ch);
  const verseStart = Number(vs);
  const verseEnd = ve ? Number(ve) : undefined;
  const reference =
    verseEnd && verseEnd !== verseStart
      ? `${bookMeta.book} ${chapter}:${verseStart}-${verseEnd}`
      : `${bookMeta.book} ${chapter}:${verseStart}`;
  const out = {
    book: bookMeta.book,
    bookEn: bookMeta.bookEn,
    chapter,
    verseStart,
    text,
    reference,
  };
  if (verseEnd && verseEnd !== verseStart) out.verseEnd = verseEnd;
  return out;
}

function loadGold() {
  const p = path.join(__dirname, "gold500-utf8.txt");
  const text = fs.readFileSync(p, "utf8");
  const verses = [];
  const fails = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const r = parseLine(line);
    if (!r) continue;
    if (r.fail) {
      fails.push(r);
      continue;
    }
    verses.push(r);
  }
  return { verses, fails };
}

function mergeVerses(existing, incoming) {
  const byRef = new Map();
  for (const v of existing) byRef.set(v.reference, v);
  let added = 0;
  let skipped = 0;
  for (const v of incoming) {
    if (byRef.has(v.reference)) {
      skipped++;
      continue;
    }
    byRef.set(v.reference, v);
    added++;
  }
  return { list: [...byRef.values()], added, skipped };
}

/** RCL-based summary packs (CUV gold-level) for missing week keys */
const LECT_ADDITIONS = {
  A: {
    trinity: {
      title: "圣三一主日",
      readings: [
        {
          slot: "旧约",
          reference: "创世记 1:1",
          text: "起初，神创造天地。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 8:1",
          text: "耶和华—我们的主啊，你的名在全地何其美！你将你的荣耀彰显于天。",
        },
        {
          slot: "书信",
          reference: "哥林多后书 13:14",
          text: "愿主耶稣基督的恩惠、神的慈爱、圣灵的感动，常与你们众人同在！",
        },
        {
          slot: "福音",
          reference: "马太福音 28:19-20",
          text: "所以，你们要去，使万民作我的门徒，奉父、子、圣灵的名给他们施洗。凡我所吩咐你们的，都教训他们遵守，我就常与你们同在，直到世界的末了。",
        },
      ],
    },
    "christ-the-king": {
      title: "基督君王主日",
      readings: [
        {
          slot: "旧约",
          reference: "以西结书 34:15-16",
          text: "主耶和华说：我必亲自作我羊的牧人，使它们得以躺卧。失丧的，我必寻找；被逐的，我必领回；受伤的，我必缠裹；有病的，我必医治。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 95:6-7",
          text: "来啊，我们要屈身敬拜，在造我们的耶和华面前跪下。因为他是我们的神；我们是他草场的羊，是他手下的民。",
        },
        {
          slot: "书信",
          reference: "以弗所书 1:20-21",
          text: "就是照他在基督身上所运行的大能大力，使他从死里复活，叫他在天上坐在自己的右边，远超过一切执政的、掌权的、有能的、主治的，和一切有名的。",
        },
        {
          slot: "福音",
          reference: "马太福音 25:40",
          text: "王要回答说：「我实在告诉你们，这些事你们既做在我这弟兄中一个最小的身上，就是做在我身上了。」",
        },
      ],
    },
    "ash-wednesday": {
      title: "圣灰日",
      readings: [
        {
          slot: "旧约",
          reference: "约珥书 2:12-13",
          text: "耶和华说：虽然如此，你们应当禁食、哭泣、悲哀，一心归向我。你们要撕裂心肠，不撕裂衣服，归向耶和华—你们的神；因为他有恩典，有怜悯，不轻易发怒，有丰盛的慈爱，并且后悔不降所说的灾。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 51:10",
          text: "神啊，求你为我造清洁的心，使我里面重新有正直的灵。",
        },
        {
          slot: "书信",
          reference: "哥林多后书 5:20",
          text: "所以，我们作基督的使者，就好像神藉我们劝你们一般。我们替基督求你们与神和好。",
        },
        {
          slot: "福音",
          reference: "马太福音 6:19-21",
          text: "不要为自己积攒财宝在地上；地上有虫子咬，能锈坏，也有贼挖窟窿来偷。只要积攒财宝在天上；天上没有虫子咬，不能锈坏，也没有贼挖窟窿来偷。因为你的财宝在哪里，你的心也在那里。",
        },
      ],
    },
    "ordinary-13": {
      title: "常年期 · 好撒玛利亚人式的怜悯",
      readings: [
        {
          slot: "旧约",
          reference: "申命记 30:19-20",
          text: "我今日呼天唤地向你作见证；我将生死祸福陈明在你面前，所以你要拣选生命，使你和你的后裔都得存活；且爱耶和华—你的神，听从他的话，专靠他；因为他是你的生命。",
        },
        {
          slot: "书信",
          reference: "罗马书 8:38-39",
          text: "因为我深信无论是死，是生，是天使，是掌权的，是有能的，是现在的事，是将来的事，是高处的，是低处的，是别的受造之物，都不能叫我们与神的爱隔绝；这爱是在我们的主基督耶稣里的。",
        },
        {
          slot: "福音",
          reference: "马太福音 13:44",
          text: "天国好像宝贝藏在地里，人遇见了就把它藏起来，欢欢喜喜地去变卖一切所有的，买这块地。",
        },
      ],
    },
    "ordinary-14": {
      title: "常年期 · 五饼二鱼与满足",
      readings: [
        {
          slot: "旧约",
          reference: "以赛亚书 55:1",
          text: "你们一切干渴的都当就近水来；没有银钱的也可以来。你们都来，买了吃；不用银钱，不用价值，也来买酒和奶。",
        },
        {
          slot: "书信",
          reference: "罗马书 8:28",
          text: "我们晓得万事都互相效力，叫爱神的人得益处，就是按他旨意被召的人。",
        },
        {
          slot: "福音",
          reference: "马太福音 14:19-20",
          text: "于是吩咐众人坐在草地上，就拿着这五个饼，两条鱼，望着天祝福，擘开饼，递给门徒，门徒又递给众人。他们都吃，并且吃饱了。",
        },
      ],
    },
    "ordinary-15": {
      title: "常年期 · 行走水面与信心",
      readings: [
        {
          slot: "旧约",
          reference: "列王纪上 19:11-12",
          text: "耶和华说：「你出来站在山上，在我面前。」那时耶和华从那里经过，在他面前有烈风大作，崩山碎石，耶和华却不在风中；风后地震，耶和华却不在其中；地震后有火，耶和华也不在火中；火后有微小的声音。",
        },
        {
          slot: "书信",
          reference: "罗马书 10:9",
          text: "你若口里认耶稣为主，心里信神叫他从死里复活，就必得救。",
        },
        {
          slot: "福音",
          reference: "马太福音 14:27",
          text: "耶稣连忙对他们说：「你们放心！是我，不要怕！」",
        },
      ],
    },
    "ordinary-16": {
      title: "常年期 · 外邦妇人的信心",
      readings: [
        {
          slot: "旧约",
          reference: "以赛亚书 56:7",
          text: "我必领他们到我的圣山，使他们在祷告我的殿中喜乐。他们的燔祭和平安祭，在我坛上必蒙悦纳，因我的殿必称为万民祷告的殿。",
        },
        {
          slot: "书信",
          reference: "罗马书 11:33",
          text: "深哉，神丰富的智慧和知识！他的判断何其难测！他的踪迹何其难寻！",
        },
        {
          slot: "福音",
          reference: "马太福音 15:28",
          text: "耶稣说：「妇人，你的信心是大的！照你所要的，给你成全了吧。」从那时候，她女儿就好了。",
        },
      ],
    },
  },
  B: {
    trinity: {
      title: "圣三一主日",
      readings: [
        {
          slot: "旧约",
          reference: "以赛亚书 6:8",
          text: "我又听见主的声音说：「我可以差遣谁呢？谁肯为我们去呢？」我说：「我在这里，请差遣我！」",
        },
        {
          slot: "诗篇",
          reference: "诗篇 29:2",
          text: "要将耶和华的名所当得的荣耀归给他，以圣洁的妆饰敬拜耶和华。",
        },
        {
          slot: "书信",
          reference: "罗马书 8:15-16",
          text: "你们所受的，不是奴仆的心，仍旧害怕；所受的，乃是儿子的心，因此我们呼叫：「阿爸！父！」圣灵与我们的心同证我们是神的儿女。",
        },
        {
          slot: "福音",
          reference: "约翰福音 3:16",
          text: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。",
        },
      ],
    },
    "christ-the-king": {
      title: "基督君王主日",
      readings: [
        {
          slot: "旧约",
          reference: "但以理书 7:14",
          text: "得了权柄、荣耀、国度，使各方、各国、各族的人都侍奉他。他的权柄是永远的，不能废去；他的国必不败坏。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 93:1",
          text: "耶和华作王！他以威严为衣穿上；耶和华以能力为衣，以能力束腰，世界就坚定，不得动摇。",
        },
        {
          slot: "书信",
          reference: "启示录 1:5-6",
          text: "并那诚实作见证的、从死里首先复活、为世上君王元首的耶稣基督，有恩惠、平安归与你们！他爱我们，用自己的血使我们脱离罪恶，又使我们成为国民，作他父神的祭司。但愿荣耀、权能归给他，直到永永远远。阿们！",
        },
        {
          slot: "福音",
          reference: "约翰福音 18:37",
          text: "彼拉多就对他说：「这样，你是王吗？」耶稣回答说：「你说我是王。我为此而生，也为此来到世间，特为给真理作见证。凡属真理的人就听我的话。」",
        },
      ],
    },
    "ash-wednesday": {
      title: "圣灰日",
      readings: [
        {
          slot: "旧约",
          reference: "约珥书 2:12-13",
          text: "耶和华说：虽然如此，你们应当禁食、哭泣、悲哀，一心归向我。你们要撕裂心肠，不撕裂衣服，归向耶和华—你们的神。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 51:17",
          text: "神所要的祭就是忧伤的灵；神啊，忧伤痛悔的心，你必不轻看。",
        },
        {
          slot: "书信",
          reference: "哥林多后书 5:21",
          text: "神使那无罪的，替我们成为罪，好叫我们在他里面成为神的义。",
        },
        {
          slot: "福音",
          reference: "马太福音 6:6",
          text: "你祷告的时候，要进你的内屋，关上门，祷告你在暗中的父；你父在暗中察看，必然报答你。",
        },
      ],
    },
    "ordinary-13": {
      title: "常年期 · 差遣与倚靠",
      readings: [
        {
          slot: "旧约",
          reference: "以西结书 2:1-2",
          text: "他对我说：「人子啊，你站起来，我要和你说话。」他对我说话的时候，灵就进入我里面，使我站起来，我便听见那位对我说话的声音。",
        },
        {
          slot: "书信",
          reference: "哥林多后书 12:9",
          text: "他对我说：「我的恩典够你用的，因为我的能力是在人的软弱上显得完全。」所以，我更喜欢夸自己的软弱，好叫基督的能力覆庇我。",
        },
        {
          slot: "福音",
          reference: "马可福音 6:7",
          text: "耶稣叫了十二个门徒来，差遣他们两个两个地出去，也赐给他们权柄，制伏污鬼。",
        },
      ],
    },
    "ordinary-14": {
      title: "常年期 · 施洗约翰之死与勇气",
      readings: [
        {
          slot: "旧约",
          reference: "阿摩司书 7:14-15",
          text: "阿摩司对亚玛谢说：「我原不是先知，也不是先知的门徒。我是牧人，又是修理桑树的。耶和华选召我，使我不跟从羊群，对我说：『你去向我民以色列说预言。』」",
        },
        {
          slot: "书信",
          reference: "以弗所书 1:3",
          text: "愿颂赞归与我们主耶稣基督的父神！他在基督里曾赐给我们天上各样属灵的福气。",
        },
        {
          slot: "福音",
          reference: "马可福音 6:34",
          text: "耶稣出来，见有许多的人，就怜悯他们，因为他们如同羊没有牧人一般，于是开口教训他们许多道理。",
        },
      ],
    },
    "ordinary-15": {
      title: "常年期 · 生命的粮",
      readings: [
        {
          slot: "旧约",
          reference: "列王纪下 4:42-43",
          text: "有一个人从巴力·沙利沙来，带着初熟大麦做的饼二十个，并新穗子，装在口袋里送给神人。神人说：「把这些给众人吃。」仆人说：「这一点岂可摆给一百人吃呢？」以利沙说：「你只管给众人吃吧！因为耶和华如此说，众人必吃了，还剩下。」",
        },
        {
          slot: "书信",
          reference: "以弗所书 3:20",
          text: "神能照着运行在我们心里的大力充充足足地成就一切，超过我们所求所想的。",
        },
        {
          slot: "福音",
          reference: "约翰福音 6:35",
          text: "耶稣说：「我就是生命的粮。到我这里来的，必定不饿；信我的，永远不渴。」",
        },
      ],
    },
    "ordinary-16": {
      title: "常年期 · 从天降下的粮",
      readings: [
        {
          slot: "旧约",
          reference: "出埃及记 16:4",
          text: "耶和华对摩西说：「我要将粮食从天降给你们。百姓可以出去，每天收每天的份，我好试验他们遵不遵我的法度。」",
        },
        {
          slot: "书信",
          reference: "以弗所书 4:1-2",
          text: "我为主被囚的劝你们：既然蒙召，行事为人就当与蒙召的恩相称。凡事谦虚、温柔、忍耐，用爱心互相宽容。",
        },
        {
          slot: "福音",
          reference: "约翰福音 6:51",
          text: "我是从天上降下来生命的粮；人若吃这粮，就必永远活着。我所要赐的粮就是我的肉，为世人之生命所赐的。",
        },
      ],
    },
  },
  C: {
    trinity: {
      title: "圣三一主日",
      readings: [
        {
          slot: "旧约",
          reference: "箴言 8:22-23",
          text: "在耶和华造化的起头，在太初创造万物之先，就有了我。从亘古，从太初，未有世界以前，我已被立。",
        },
        {
          slot: "诗篇",
          reference: "诗篇 8:4",
          text: "便说：人算什么，你竟顾念他？世人算什么，你竟眷顾他？",
        },
        {
          slot: "书信",
          reference: "罗马书 5:1-2",
          text: "我们既因信称义，就藉着我们的主耶稣基督得与神相和。我们又藉着他，因信得进入现在所站的这恩典中，并且欢欢喜喜盼望神的荣耀。",
        },
        {
          slot: "福音",
          reference: "约翰福音 16:13",
          text: "只等真理的圣灵来了，他要引导你们明白一切的真理；因为他不是凭自己说的，乃是把他所听见的都说出来，并要把将来的事告诉你们。",
        },
      ],
    },
    "christ-the-king": {
      title: "基督君王主日",
      readings: [
        {
          slot: "旧约",
          reference: "耶利米书 23:5",
          text: "耶和华说：「日子将到，我要给大卫兴起一个公义的苗裔；他必掌王权，行事有智慧，在地上施行公平和公义。」",
        },
        {
          slot: "诗篇",
          reference: "诗篇 46:10",
          text: "你们要休息，要知道我是神！我必在外邦中被尊崇，在遍地上也被尊崇。",
        },
        {
          slot: "书信",
          reference: "歌罗西书 1:13-14",
          text: "他救了我们脱离黑暗的权势，把我们迁到他爱子的国里；我们在爱子里得蒙救赎，罪过得以赦免。",
        },
        {
          slot: "福音",
          reference: "路加福音 23:42-43",
          text: "就说：「耶稣啊，你得国降临的时候，求你记念我！」耶稣对他说：「我实在告诉你，今日你要同我在乐园里了。」",
        },
      ],
    },
    "ash-wednesday": {
      title: "圣灰日",
      readings: [
        {
          slot: "旧约",
          reference: "以赛亚书 58:6",
          text: "我所拣选的禁食不是要松开凶恶的绳，解下轭上的索，使被欺压的得自由，折断一切的轭吗？",
        },
        {
          slot: "诗篇",
          reference: "诗篇 51:1",
          text: "神啊，求你按你的慈爱怜恤我！按你丰盛的慈悲涂抹我的过犯！",
        },
        {
          slot: "书信",
          reference: "哥林多后书 6:2",
          text: "因为他说：「在悦纳的时候，我应允了你；在拯救的日子，我搭救了你。」看哪，现在正是悦纳的时候！现在正是拯救的日子。",
        },
        {
          slot: "福音",
          reference: "马太福音 6:21",
          text: "因为你的财宝在哪里，你的心也在那里。",
        },
      ],
    },
    "ordinary-13": {
      title: "常年期 · 好撒玛利亚人",
      readings: [
        {
          slot: "旧约",
          reference: "申命记 30:14",
          text: "这话却离你甚近，就在你口中，在你心里，使你可以遵行。",
        },
        {
          slot: "书信",
          reference: "歌罗西书 1:13-14",
          text: "他救了我们脱离黑暗的权势，把我们迁到他爱子的国里；我们在爱子里得蒙救赎，罪过得以赦免。",
        },
        {
          slot: "福音",
          reference: "路加福音 10:27",
          text: "他回答说：「你要尽心、尽性、尽力、尽意爱主—你的神；又要爱邻舍如同自己。」",
        },
      ],
    },
    "ordinary-14": {
      title: "常年期 · 马利亚与马大",
      readings: [
        {
          slot: "旧约",
          reference: "创世记 18:14",
          text: "耶和华岂有难成的事吗？到了日期，明年这时候，我必回到你这里，撒拉必生一个儿子。",
        },
        {
          slot: "书信",
          reference: "歌罗西书 1:27",
          text: "神愿意叫他们知道，这奥秘在外邦人中有何等丰盛的荣耀，就是基督在你们心里成了有荣耀的盼望。",
        },
        {
          slot: "福音",
          reference: "路加福音 10:41-42",
          text: "耶稣回答说：「马大！马大！你为许多的事思虑烦扰，但是不可少的只有一件；马利亚已经选择那上好的福分，是不能夺去的。」",
        },
      ],
    },
    "ordinary-15": {
      title: "常年期 · 主祷文与祈求",
      readings: [
        {
          slot: "旧约",
          reference: "创世记 18:32",
          text: "亚伯拉罕说：「求主不要动怒，我再说这一次，假若在那里见有十个呢？」他说：「为这十个的缘故，我也不毁灭那城。」",
        },
        {
          slot: "书信",
          reference: "歌罗西书 2:6-7",
          text: "你们既然接受了主基督耶稣，就当遵他而行，在他里面生根建造，信心坚固，正如你们所领的教训，感谢的心也更增长了。",
        },
        {
          slot: "福音",
          reference: "路加福音 11:9",
          text: "我又告诉你们，你们祈求，就给你们；寻找，就寻见；叩门，就给你们开门。",
        },
      ],
    },
    "ordinary-16": {
      title: "常年期 · 无知的财主",
      readings: [
        {
          slot: "旧约",
          reference: "传道书 1:2",
          text: "传道者说：虚空的虚空，虚空的虚空，凡事都是虚空。",
        },
        {
          slot: "书信",
          reference: "歌罗西书 3:2",
          text: "你们要思念上面的事，不要思念地上的事。",
        },
        {
          slot: "福音",
          reference: "路加福音 12:15",
          text: "于是对众人说：「你们要谨慎自守，免去一切的贪心，因为人的生命不在乎家道丰富。」",
        },
      ],
    },
  },
};

function mergeLectionary(existing) {
  let weeksAdded = 0;
  let readingsAdded = 0;
  for (const year of ["A", "B", "C"]) {
    if (!existing[year]) existing[year] = {};
    const adds = LECT_ADDITIONS[year] || {};
    for (const [weekKey, pack] of Object.entries(adds)) {
      if (!existing[year][weekKey]) {
        existing[year][weekKey] = pack;
        weeksAdded++;
        readingsAdded += pack.readings.length;
      } else {
        // merge missing slots only
        const have = new Set(existing[year][weekKey].readings.map((r) => r.slot + "|" + r.reference));
        for (const r of pack.readings) {
          const k = r.slot + "|" + r.reference;
          if (!have.has(k)) {
            existing[year][weekKey].readings.push(r);
            readingsAdded++;
            have.add(k);
          }
        }
      }
    }
  }
  return { weeksAdded, readingsAdded };
}

function main() {
  const seedPath = path.join(dataDir, "verses-cuv-seed.json");
  const lectPath = path.join(dataDir, "lectionary-readings.json");
  const existing = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  const before = existing.length;

  const { verses: gold, fails } = loadGold();
  const { list, added, skipped } = mergeVerses(existing, gold);
  fs.writeFileSync(seedPath, JSON.stringify(list, null, 2) + "\n", "utf8");

  const lect = JSON.parse(fs.readFileSync(lectPath, "utf8"));
  const lectBeforeWeeks = ["A", "B", "C"].reduce(
    (n, y) => n + Object.keys(lect[y] || {}).length,
    0
  );
  const { weeksAdded, readingsAdded } = mergeLectionary(lect);
  fs.writeFileSync(lectPath, JSON.stringify(lect, null, 2) + "\n", "utf8");
  const lectAfterWeeks = ["A", "B", "C"].reduce(
    (n, y) => n + Object.keys(lect[y] || {}).length,
    0
  );

  const samples = list.slice(-5);
  const report = `# 经文资料导入报告

生成时间：${new Date().toISOString()}

## 来源

| 源文件 | 处理方式 |
|--------|----------|
| \`Downloads/圣经金句500句.txt\` (GBK/GB18030) | 内容与雅博网「圣经箴言500句」一致；UTF-8 整理版见 \`scripts/gold500-utf8.txt\` |
| \`Downloads/xunzai.com_圣经金句，天天享受.doc\` | OLE .doc；本机 shell 不可用时未能 COM 抽取；金句池以 500 句 UTF-8 为主 |
| \`Downloads/圣经金句选.doc\` | 同上 |
| \`Downloads/三代经课的经文.doc\` | 同上；经课扩充采用 RCL 公开表（\`gw_lectionary.pdf\` / commontexts）+ 和合本摘要 |

## 金句池 verses-cuv-seed.json

| 指标 | 数量 |
|------|------|
| 导入前 | ${before} |
| gold500 解析成功 | ${gold.length} |
| 解析失败 | ${fails.length} |
| 与已有 reference 重复跳过 | ${skipped} |
| **新增** | **${added}** |
| 导入后 | ${list.length} |

### 样本（末尾 5 条）

${samples.map((v) => `- **${v.reference}**：${v.text.slice(0, 40)}…`).join("\n")}

### 解析失败（如有）

${fails.length ? fails.map((f) => `- ${f.reason || ""}: ${String(f.fail).slice(0, 80)}`).join("\n") : "_无_"}

## 经课 lectionary-readings.json

| 指标 | 数量 |
|------|------|
| 导入前 week keys（A+B+C） | ${lectBeforeWeeks} |
| 新增 week keys | ${weeksAdded} |
| 新增 readings 条数 | ${readingsAdded} |
| 导入后 week keys | ${lectAfterWeeks} |

新增键（若原先缺失）：\`trinity\`、\`christ-the-king\`、\`ash-wednesday\`、\`ordinary-13\`…\`ordinary-16\`（A/B/C）。

## 备注

- 优先和合本（CUV）用语；源中「伶恤」等笔误已规范为「怜恤」。
- 未删除任何既有金句或经课周次。
- 可选：运行后手工补 \`topics.ts\` 标签；ESV map 未批量填充。
- 修复 Grok shell：\`mklink /H %USERPROFILE%\\.grok\\bin\\powershell.exe C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe\`
`;

  fs.mkdirSync(docsDir, { recursive: true });
  const reportPath = path.join(docsDir, "IMPORT_SOURCES_REPORT.md");
  fs.writeFileSync(reportPath, report, "utf8");
  console.log(report);
  console.log("Wrote", seedPath, lectPath, reportPath);
}

main();
