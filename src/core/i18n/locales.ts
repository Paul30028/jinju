/** App UI 语言（系统界面，非经文译本） */
export type AppLocale = "zh" | "en" | "de" | "fr";

export const APP_LOCALES: { id: AppLocale; label: string; native: string }[] = [
  { id: "zh", label: "Chinese", native: "中文" },
  { id: "en", label: "English", native: "English" },
  { id: "de", label: "German", native: "Deutsch" },
  { id: "fr", label: "French", native: "Français" },
];

export type MessageKey =
  | "app.name"
  | "app.tagline"
  | "nav.today"
  | "nav.explore"
  | "nav.create"
  | "nav.me"
  | "nav.main"
  | "common.refresh"
  | "common.open"
  | "common.delete"
  | "common.clear"
  | "common.all"
  | "common.preview"
  | "common.generate"
  | "common.loading"
  | "common.cuv"
  | "common.verses"
  | "settings.badge"
  | "settings.title"
  | "settings.intro"
  | "settings.appearance"
  | "settings.appearance.system"
  | "settings.appearance.light"
  | "settings.appearance.dark"
  | "settings.appLanguage"
  | "settings.verseLanguage"
  | "settings.verse.zhEn"
  | "settings.verse.zh"
  | "settings.verse.en"
  | "settings.defaultTheme"
  | "settings.defaultLayout"
  | "settings.defaultSize"
  | "settings.size.story"
  | "settings.size.square"
  | "settings.size.landscape"
  | "settings.autoLayout"
  | "settings.usePhoto"
  | "settings.library"
  | "settings.library.hint"
  | "settings.library.current"
  | "settings.library.refresh"
  | "settings.library.refreshing"
  | "settings.save"
  | "settings.saved"
  | "settings.about"
  | "settings.about.1"
  | "settings.about.2"
  | "settings.about.3"
  | "me.history"
  | "me.collection"
  | "me.settings"
  | "explore.topics"
  | "explore.lectionary"
  | "today.meditation"
  | "today.createCustom"
  | "today.localRender"
  | "studio.save"
  | "studio.share"
  | "studio.zh"
  | "studio.zhEn"
  | "studio.en"
  | "studio.favorite"
  | "studio.favorited"
  | "studio.swap"
  | "studio.swapping"
  | "studio.adjust"
  | "studio.adjustClose"
  | "studio.language"
  | "studio.theme"
  | "studio.layout"
  | "studio.size"
  | "studio.ready"
  | "studio.generating"
  | "studio.generatingEn"
  | "studio.swappingTheme"
  | "studio.done"
  | "studio.doneSwap"
  | "studio.doneGradient"
  | "studio.enNeedNet"
  | "studio.fail"
  | "studio.saving"
  | "studio.savedNative"
  | "studio.savedWeb"
  | "studio.savedLongpress"
  | "studio.saveFail"
  | "studio.favAdded"
  | "studio.favRemoved"
  | "studio.swapThemeOnly"
  | "share.title"
  | "share.close"
  | "share.processing"
  | "share.fail"
  | "share.wechatNote"
  | "share.whyTitle"
  | "share.whyBody"
  | "share.longpress"
  | "share.tip"
  | "history.badge"
  | "history.title"
  | "history.empty"
  | "history.clearConfirm"
  | "collection.badge"
  | "collection.title"
  | "collection.empty"
  | "collection.remove"
  | "create.badge"
  | "create.title"
  | "create.intro"
  | "create.ref"
  | "create.refPh"
  | "create.body"
  | "create.bodyPh"
  | "create.submit"
  | "create.fillToday"
  | "create.error"
  | "topics.badge"
  | "topics.title"
  | "topics.intro"
  | "topics.fruitToday"
  | "topics.fruitHint"
  | "topics.viewFruit"
  | "topics.fruitSection"
  | "topics.lifeSection"
  | "topics.empty"
  | "topics.count"
  | "topics.countAll"
  | "topics.fruitIntro"
  | "topics.fruitRef"
  | "lectionary.badge"
  | "lectionary.extend"
  | "lectionary.year"
  | "lectionary.note"
  | "theme.dawn"
  | "theme.night"
  | "theme.wilderness"
  | "theme.mist"
  | "theme.parchment"
  | "theme.sanctuary"
  | "theme.olive"
  | "theme.river"
  | "template.center"
  | "template.center-quote"
  | "template.top-bottom"
  | "template.bottom"
  | "template.left-right"
  | "template.left-rail"
  | "topic.hope"
  | "topic.comfort"
  | "topic.faith"
  | "topic.strength"
  | "topic.wisdom"
  | "topic.gratitude"
  | "topic.presence"
  | "topic.salvation"
  | "topic.love"
  | "topic.joy"
  | "topic.peace"
  | "topic.patience"
  | "topic.kindness"
  | "topic.goodness"
  | "topic.faithfulness"
  | "topic.gentleness"
  | "topic.self_control"
  | "share.target.system"
  | "share.target.save"
  | "share.target.copy"
  | "share.target.wechat"
  | "share.target.moments"
  | "share.target.xiaohongshu"
  | "share.target.instagram"
  | "share.target.x"
  | "share.target.facebook"
  | "share.target.whatsapp"
  | "share.hint.system"
  | "share.hint.save"
  | "share.hint.copy"
  | "share.hint.wechat"
  | "share.hint.moments"
  | "share.hint.xiaohongshu"
  | "share.hint.instagram"
  | "share.hint.x"
  | "share.hint.facebook"
  | "share.hint.whatsapp"
  | "share.size.current"
  | "share.size.square"
  | "share.size.story"
  | "share.size.land"
  | "share.size.any"
  | "share.msg.systemOpened"
  | "share.msg.cancelled"
  | "share.msg.unsupported"
  | "share.msg.saved"
  | "share.msg.copied"
  | "share.msg.copyFail"
  | "share.msg.wechatInApp"
  | "share.msg.pickWechat"
  | "share.msg.pickWhatsapp"
  | "share.msg.guide.wechat"
  | "share.msg.guide.moments"
  | "share.msg.guide.xiaohongshu"
  | "share.msg.guide.instagram"
  | "share.msg.guide.x"
  | "share.msg.guide.facebook"
  | "share.msg.guide.whatsapp"
  | "share.msg.savedCopy"
  | "share.dialogTitle"
  | "share.caption.cuv"
  | "share.caption.noEn"
  | "share.caption.tag"
  | "image.kicker"
;

type Dict = Record<MessageKey, string>;

const zh: Dict = {
  "app.name": "Serein 静澄",
  "app.tagline": "每日一句 · 安静留白",
  "nav.today": "今日",
  "nav.explore": "探索",
  "nav.create": "制作",
  "nav.me": "我的",
  "nav.main": "主导航",
  "common.refresh": "刷新",
  "common.open": "打开",
  "common.delete": "删除",
  "common.clear": "清空",
  "common.all": "全部",
  "common.preview": "预览",
  "common.generate": "生成",
  "common.loading": "读取中…",
  "common.cuv": "和合本",
  "common.verses": "节",
  "settings.badge": "偏好",
  "settings.title": "设置",
  "settings.intro": "外观、语言与成图偏好保存在本机。切换软件语言后界面立即更新。",
  "settings.appearance": "外观",
  "settings.appearance.system": "跟随系统",
  "settings.appearance.light": "浅色",
  "settings.appearance.dark": "深色",
  "settings.appLanguage": "软件语言",
  "settings.verseLanguage": "金句语言（成图）",
  "settings.verse.zhEn": "中英双语",
  "settings.verse.zh": "仅中文",
  "settings.verse.en": "仅英文",
  "settings.defaultTheme": "默认主题",
  "settings.defaultLayout": "默认版式",
  "settings.defaultSize": "默认尺寸",
  "settings.size.story": "竖版 Stories",
  "settings.size.square": "方形",
  "settings.size.landscape": "横版",
  "settings.autoLayout": "每日自动轮换主题与版式",
  "settings.usePhoto": "使用摄影背景（失败时用主题色）",
  "settings.library": "本地图库",
  "settings.library.hint":
    "打包内置 60 张主题摄影图；严格按主题匹配。离线时使用主题色。",
  "settings.library.current": "当前",
  "settings.library.refresh": "刷新图库",
  "settings.library.refreshing": "更新中…",
  "settings.save": "保存设置",
  "settings.saved": "已保存",
  "settings.about": "关于",
  "settings.about.1": "经文文字本地叠字，不依赖 AI 写字",
  "settings.about.2": "多语言界面 · 中英经文 · 多主题版式",
  "settings.about.3": "数据默认仅存本机",
  "me.history": "历史",
  "me.collection": "收藏",
  "me.settings": "设置",
  "explore.topics": "主题",
  "explore.lectionary": "经课",
  "today.meditation": "默想",
  "today.createCustom": "制作自定义",
  "today.localRender": "本地成图",
  "studio.save": "保存",
  "studio.share": "分享",
  "studio.zh": "中文",
  "studio.zhEn": "中英",
  "studio.en": "English",
  "studio.favorite": "收藏",
  "studio.favorited": "已收藏",
  "studio.swap": "换图",
  "studio.swapping": "换图中…",
  "studio.adjust": "调整",
  "studio.adjustClose": "收起调整",
  "studio.language": "语言",
  "studio.theme": "主题",
  "studio.layout": "版式",
  "studio.size": "尺寸",
  "studio.ready": "准备中…",
  "studio.generating": "生成中…",
  "studio.generatingEn": "生成英文版…",
  "studio.swappingTheme": "更换同主题图片…",
  "studio.done": "已生成",
  "studio.doneSwap": "已换图",
  "studio.doneGradient": "主题色",
  "studio.enNeedNet": "英文需联网，请检查网络后重试",
  "studio.fail": "生成失败，请重试",
  "studio.saving": "正在保存图片…",
  "studio.savedNative": "已保存到「文档/jinju-ri」文件夹",
  "studio.savedWeb": "已开始下载，请到浏览器下载目录查看",
  "studio.savedLongpress": "已打开图片，请长按保存到相册",
  "studio.saveFail": "保存失败，请长按预览图保存",
  "studio.favAdded": "已加入收藏",
  "studio.favRemoved": "已取消收藏",
  "studio.swapThemeOnly": "换图仅在当前主题内轮换，不会串主题",
  "share.title": "分享金句",
  "share.close": "关闭",
  "share.processing": "处理中…",
  "share.fail": "分享失败，请长按预览图保存后再发送",
  "share.wechatNote":
    "检测到微信内置浏览器：无法直接调起「发图到微信」。请长按下方预览图保存，或点「保存图片」。",
  "share.whyTitle": "为何微信会失败？",
  "share.whyBody":
    "微信未对普通网页开放「一键把本地图片发到聊天/朋友圈」。可靠做法是：系统分享选微信，或先存图再从相册发送。",
  "share.longpress": "手机可长按图片 → 保存到相册",
  "share.tip":
    "推荐：用系统浏览器打开 →「系统分享」→ 选微信。朋友圈建议方形尺寸。",
  "history.badge": "近期记录",
  "history.title": "历史",
  "history.empty": "还没有记录。在「今日」生成一张后会自动出现在这里。",
  "history.clearConfirm": "确定清空全部历史？",
  "collection.badge": "收藏夹",
  "collection.title": "收藏",
  "collection.empty": "还没有收藏。在「今日」或「制作」页点击「收藏」即可保存。",
  "collection.remove": "取消收藏",
  "create.badge": "自定义",
  "create.title": "制作金句图",
  "create.intro": "输入经文正文与出处，生成可保存、可分享的图片。请确保使用准确译本原文。",
  "create.ref": "经文出处",
  "create.refPh": "例如：诗篇 23:1",
  "create.body": "经文正文（和合本）",
  "create.bodyPh": "请粘贴圣经原文…",
  "create.submit": "生成图片",
  "create.fillToday": "填入今日金句",
  "create.error": "无法生成",
  "topics.badge": "探索",
  "topics.title": "按主题默想",
  "topics.intro": "按生命主题或圣灵果子挑选经文，做成可分享的金句图。",
  "topics.fruitToday": "今日果子",
  "topics.fruitHint": "九果按日轮换，点下方主题查看经文",
  "topics.viewFruit": "查看今日果子经文",
  "topics.fruitSection": "圣灵的果子（九）",
  "topics.lifeSection": "生命主题",
  "topics.empty": "此主题暂无经文，请换一个。",
  "topics.count": "节",
  "topics.countAll": "共",
  "topics.fruitIntro":
    "圣灵所结的果子，就是仁爱、喜乐、和平、忍耐、恩慈、良善、信实、温柔、节制。这样的事没有律法禁止。",
  "topics.fruitRef": "加拉太书 5:22-23",
  "lectionary.badge": "经课",
  "lectionary.extend": "本周使用季节延伸读经（完整主日表可继续扩充）",
  "lectionary.year": "经课年",
  "lectionary.note":
    "说明：三代经课按日期切换；2026 年优先使用 PCT 经课表，其他日期使用本地经课年回退。",
  "theme.dawn": "黎明",
  "theme.night": "静夜",
  "theme.wilderness": "旷野",
  "theme.mist": "晨雾",
  "theme.parchment": "书卷",
  "theme.sanctuary": "圣所",
  "theme.olive": "橄榄",
  "theme.river": "活水",
  "template.center": "经典居中",
  "template.center-quote": "引号海报",
  "template.top-bottom": "上沉浸",
  "template.bottom": "玻璃底卡",
  "template.left-right": "侧栏海报",
  "template.left-rail": "金轨侧排",
  "topic.hope": "盼望",
  "topic.comfort": "安慰",
  "topic.faith": "信心",
  "topic.strength": "刚强",
  "topic.wisdom": "智慧",
  "topic.gratitude": "感恩",
  "topic.presence": "同在",
  "topic.salvation": "救恩",
  "topic.love": "仁爱",
  "topic.joy": "喜乐",
  "topic.peace": "和平",
  "topic.patience": "忍耐",
  "topic.kindness": "恩慈",
  "topic.goodness": "良善",
  "topic.faithfulness": "信实",
  "topic.gentleness": "温柔",
  "topic.self_control": "节制",
  "share.target.system": "系统分享",
  "share.target.save": "保存图片",
  "share.target.copy": "复制经文",
  "share.target.wechat": "微信",
  "share.target.moments": "朋友圈",
  "share.target.xiaohongshu": "小红书",
  "share.target.instagram": "Instagram",
  "share.target.x": "X (Twitter)",
  "share.target.facebook": "Facebook",
  "share.target.whatsapp": "WhatsApp",
  "share.hint.system": "打开系统面板，可选微信等（推荐）",
  "share.hint.save": "下载到相册/下载目录",
  "share.hint.copy": "复制经文到剪贴板",
  "share.hint.wechat": "先保存再从微信相册发送",
  "share.hint.moments": "先保存再发朋友圈",
  "share.hint.xiaohongshu": "保存后在小红书上传",
  "share.hint.instagram": "保存后在 IG 发帖",
  "share.hint.x": "保存后发帖上传",
  "share.hint.facebook": "保存后发帖或系统分享",
  "share.hint.whatsapp": "系统分享选 WhatsApp",
  "share.size.current": "当前尺寸",
  "share.size.square": "方形 1080",
  "share.size.story": "竖版 Stories",
  "share.size.land": "横版或方形",
  "share.size.any": "—",
  "share.msg.systemOpened": "已打开系统分享，请选择目标应用。",
  "share.msg.cancelled": "已取消分享",
  "share.msg.unsupported": "当前环境不支持系统分享：已下载图片并复制文案。",
  "share.msg.saved": "图片已保存。可在相册/下载中找到。",
  "share.msg.copied": "经文已复制到剪贴板。",
  "share.msg.copyFail": "复制失败，请手动选择文字复制。",
  "share.msg.wechatInApp": "当前在微信内打开：已保存图片并复制文案。请用浏览器打开或从相册发图。",
  "share.msg.pickWechat": "已打开系统分享，请选择微信。",
  "share.msg.pickWhatsapp": "已打开系统分享，请选择 WhatsApp。",
  "share.msg.guide.wechat": "已保存图片并复制文案。打开微信 → 相册发送。",
  "share.msg.guide.moments": "已保存图片并复制文案。打开朋友圈从相册选择。",
  "share.msg.guide.xiaohongshu": "已保存图片并复制文案。打开小红书发布笔记。",
  "share.msg.guide.instagram": "已保存图片。打开 Instagram 从相册选择。",
  "share.msg.guide.x": "已保存图片并复制文案。打开 X 发帖上传。",
  "share.msg.guide.facebook": "已保存图片并复制文案。打开 Facebook 发帖。",
  "share.msg.guide.whatsapp": "已保存图片并复制文案。打开 WhatsApp 从相册发送。",
  "share.msg.savedCopy": "已保存图片并复制文案。",
  "share.dialogTitle": "分享",
  "share.caption.cuv": "和合本",
  "share.caption.noEn": "中文；暂无英文对照",
  "share.caption.tag": "#Serein",
  "image.kicker": "静澄  ·  SEREIN",
};

const en: Dict = {
  "app.name": "Serein",
  "app.tagline": "One quiet line a day",
  "nav.today": "Today",
  "nav.explore": "Explore",
  "nav.create": "Create",
  "nav.me": "Me",
  "nav.main": "Main navigation",
  "common.refresh": "Refresh",
  "common.open": "Open",
  "common.delete": "Delete",
  "common.clear": "Clear",
  "common.all": "All",
  "common.preview": "Preview",
  "common.generate": "Generate",
  "common.loading": "Loading…",
  "common.cuv": "CUV",
  "common.verses": "verses",
  "settings.badge": "Preferences",
  "settings.title": "Settings",
  "settings.intro":
    "Appearance, language and image preferences are stored on this device. The UI updates immediately when you change app language.",
  "settings.appearance": "Appearance",
  "settings.appearance.system": "System",
  "settings.appearance.light": "Light",
  "settings.appearance.dark": "Dark",
  "settings.appLanguage": "App language",
  "settings.verseLanguage": "Verse language (image)",
  "settings.verse.zhEn": "Chinese + English",
  "settings.verse.zh": "Chinese only",
  "settings.verse.en": "English only",
  "settings.defaultTheme": "Default theme",
  "settings.defaultLayout": "Default layout",
  "settings.defaultSize": "Default size",
  "settings.size.story": "Portrait Stories",
  "settings.size.square": "Square",
  "settings.size.landscape": "Landscape",
  "settings.autoLayout": "Auto-rotate theme & layout daily",
  "settings.usePhoto": "Photo backgrounds (theme color if offline)",
  "settings.library": "Photo library",
  "settings.library.hint":
    "60 themed photos bundled; strict theme matching. Theme gradient offline.",
  "settings.library.current": "Current",
  "settings.library.refresh": "Refresh library",
  "settings.library.refreshing": "Updating…",
  "settings.save": "Save settings",
  "settings.saved": "Saved",
  "settings.about": "About",
  "settings.about.1": "Verse text is rendered locally on canvas — no AI lettering",
  "settings.about.2": "Multi-language UI · bilingual verses · multiple layouts",
  "settings.about.3": "Data stays on your device by default",
  "me.history": "History",
  "me.collection": "Favorites",
  "me.settings": "Settings",
  "explore.topics": "Topics",
  "explore.lectionary": "Lectionary",
  "today.meditation": "Reflect",
  "today.createCustom": "Custom verse",
  "today.localRender": "Local render",
  "studio.save": "Save",
  "studio.share": "Share",
  "studio.zh": "Chinese",
  "studio.zhEn": "ZH+EN",
  "studio.en": "English",
  "studio.favorite": "Favorite",
  "studio.favorited": "Saved",
  "studio.swap": "New photo",
  "studio.swapping": "Swapping…",
  "studio.adjust": "Adjust",
  "studio.adjustClose": "Close",
  "studio.language": "Language",
  "studio.theme": "Theme",
  "studio.layout": "Layout",
  "studio.size": "Size",
  "studio.ready": "Preparing…",
  "studio.generating": "Generating…",
  "studio.generatingEn": "Generating English…",
  "studio.swappingTheme": "New photo in this theme…",
  "studio.done": "Done",
  "studio.doneSwap": "Photo updated",
  "studio.doneGradient": "theme color",
  "studio.enNeedNet": "English needs network — try again online",
  "studio.fail": "Generation failed — try again",
  "studio.saving": "Saving image…",
  "studio.savedNative": "Saved to Documents/jinju-ri",
  "studio.savedWeb": "Download started — check your browser downloads",
  "studio.savedLongpress": "Image opened — long-press to save",
  "studio.saveFail": "Save failed — long-press the preview",
  "studio.favAdded": "Added to favorites",
  "studio.favRemoved": "Removed from favorites",
  "studio.swapThemeOnly": "Photos rotate only within the current theme",
  "share.title": "Share verse",
  "share.close": "Close",
  "share.processing": "Working…",
  "share.fail": "Share failed — long-press preview to save first",
  "share.wechatNote":
    "WeChat in-app browser cannot send images directly. Long-press the preview to save, or use Save.",
  "share.whyTitle": "Why WeChat fails?",
  "share.whyBody":
    "WeChat does not allow web pages to post local images to chat/moments. Use system share → WeChat, or save then send from gallery.",
  "share.longpress": "Long-press image → save to album",
  "share.tip":
    "Tip: open in system browser → Share → WeChat. Moments work best with square size.",
  "history.badge": "Recent",
  "history.title": "History",
  "history.empty": "No history yet. Generate one on Today and it appears here.",
  "history.clearConfirm": "Clear all history?",
  "collection.badge": "Favorites",
  "collection.title": "Favorites",
  "collection.empty":
    "No favorites yet. Tap Favorite on Today or Create to save.",
  "collection.remove": "Remove",
  "create.badge": "Custom",
  "create.title": "Create verse image",
  "create.intro":
    "Enter the verse text and reference to make a shareable image. Use an accurate translation.",
  "create.ref": "Reference",
  "create.refPh": "e.g. Psalm 23:1",
  "create.body": "Verse text (Chinese CUV)",
  "create.bodyPh": "Paste scripture text…",
  "create.submit": "Generate image",
  "create.fillToday": "Use today’s verse",
  "create.error": "Could not generate",
  "topics.badge": "Explore",
  "topics.title": "Meditate by topic",
  "topics.intro":
    "Pick life topics or the fruit of the Spirit, then make a verse card.",
  "topics.fruitToday": "Today’s fruit",
  "topics.fruitHint": "Nine fruits rotate daily — tap a topic below",
  "topics.viewFruit": "View today’s fruit verses",
  "topics.fruitSection": "Fruit of the Spirit (9)",
  "topics.lifeSection": "Life topics",
  "topics.empty": "No verses for this topic — try another.",
  "topics.count": "verses",
  "topics.countAll": "Total",
  "topics.fruitIntro":
    "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.",
  "topics.fruitRef": "Galatians 5:22-23",
  "lectionary.badge": "Lectionary",
  "lectionary.extend": "Seasonal extension readings this week (full calendar expandable)",
  "lectionary.year": "Year",
  "lectionary.note":
    "Readings change by date. PCT 2026 readings are preferred, with local lectionary-year fallback.",
  "theme.dawn": "Dawn",
  "theme.night": "Night",
  "theme.wilderness": "Wilderness",
  "theme.mist": "Mist",
  "theme.parchment": "Parchment",
  "theme.sanctuary": "Sanctuary",
  "theme.olive": "Olive",
  "theme.river": "Living water",
  "template.center": "Centered",
  "template.center-quote": "Quote poster",
  "template.top-bottom": "Top immersion",
  "template.bottom": "Glass card",
  "template.left-right": "Side panel",
  "template.left-rail": "Gold rail",
  "topic.hope": "Hope",
  "topic.comfort": "Comfort",
  "topic.faith": "Faith",
  "topic.strength": "Strength",
  "topic.wisdom": "Wisdom",
  "topic.gratitude": "Gratitude",
  "topic.presence": "Presence",
  "topic.salvation": "Salvation",
  "topic.love": "Love",
  "topic.joy": "Joy",
  "topic.peace": "Peace",
  "topic.patience": "Patience",
  "topic.kindness": "Kindness",
  "topic.goodness": "Goodness",
  "topic.faithfulness": "Faithfulness",
  "topic.gentleness": "Gentleness",
  "topic.self_control": "Self-control",
  "share.target.system": "System share",
  "share.target.save": "Save image",
  "share.target.copy": "Copy verse",
  "share.target.wechat": "WeChat",
  "share.target.moments": "Moments",
  "share.target.xiaohongshu": "Xiaohongshu",
  "share.target.instagram": "Instagram",
  "share.target.x": "X (Twitter)",
  "share.target.facebook": "Facebook",
  "share.target.whatsapp": "WhatsApp",
  "share.hint.system": "Open the system share sheet (recommended)",
  "share.hint.save": "Save to album/downloads",
  "share.hint.copy": "Copy verse to clipboard",
  "share.hint.wechat": "Save first, then send from WeChat album",
  "share.hint.moments": "Save first, then post to Moments",
  "share.hint.xiaohongshu": "Save, then upload in Xiaohongshu",
  "share.hint.instagram": "Save, then post in Instagram",
  "share.hint.x": "Save, then post on X",
  "share.hint.facebook": "Save, then post or system-share",
  "share.hint.whatsapp": "System share → WhatsApp",
  "share.size.current": "Current size",
  "share.size.square": "Square 1080",
  "share.size.story": "Stories portrait",
  "share.size.land": "Landscape or square",
  "share.size.any": "—",
  "share.msg.systemOpened": "System share opened. Pick an app.",
  "share.msg.cancelled": "Share cancelled",
  "share.msg.unsupported": "System share unavailable: image downloaded and caption copied.",
  "share.msg.saved": "Image saved. Check album/downloads.",
  "share.msg.copied": "Verse copied to clipboard.",
  "share.msg.copyFail": "Copy failed — select text manually.",
  "share.msg.wechatInApp": "Opened inside WeChat: image saved and caption copied. Use browser or album to send.",
  "share.msg.pickWechat": "System share opened — choose WeChat.",
  "share.msg.pickWhatsapp": "System share opened — choose WhatsApp.",
  "share.msg.guide.wechat": "Saved image and copied caption. WeChat → chat → album.",
  "share.msg.guide.moments": "Saved image and copied caption. Post to Moments from album.",
  "share.msg.guide.xiaohongshu": "Saved image and copied caption. Upload in Xiaohongshu.",
  "share.msg.guide.instagram": "Image saved. Open Instagram and pick from album.",
  "share.msg.guide.x": "Saved image and copied caption. Post on X.",
  "share.msg.guide.facebook": "Saved image and copied caption. Post on Facebook.",
  "share.msg.guide.whatsapp": "Saved image and copied caption. Send via WhatsApp album.",
  "share.msg.savedCopy": "Image saved and caption copied.",
  "share.dialogTitle": "Share",
  "share.caption.cuv": "CUV",
  "share.caption.noEn": "Chinese; no English yet",
  "share.caption.tag": "#Serein",
  "image.kicker": "SEREIN",
};

const de: Dict = {
  "app.name": "Serein",
  "app.tagline": "Ein stiller Satz am Tag",
  "nav.today": "Heute",
  "nav.explore": "Entdecken",
  "nav.create": "Erstellen",
  "nav.me": "Ich",
  "nav.main": "Hauptnavigation",
  "common.refresh": "Aktualisieren",
  "common.open": "Öffnen",
  "common.delete": "Löschen",
  "common.clear": "Leeren",
  "common.all": "Alle",
  "common.preview": "Vorschau",
  "common.generate": "Erzeugen",
  "common.loading": "Laden…",
  "common.cuv": "CUV",
  "common.verses": "Verse",
  "settings.badge": "Einstellungen",
  "settings.title": "Einstellungen",
  "settings.intro":
    "Darstellung, Sprache und Bildoptionen werden lokal gespeichert. Die Oberfläche wechselt sofort mit der App-Sprache.",
  "settings.appearance": "Darstellung",
  "settings.appearance.system": "System",
  "settings.appearance.light": "Hell",
  "settings.appearance.dark": "Dunkel",
  "settings.appLanguage": "App-Sprache",
  "settings.verseLanguage": "Vers-Sprache (Bild)",
  "settings.verse.zhEn": "Chinesisch + Englisch",
  "settings.verse.zh": "Nur Chinesisch",
  "settings.verse.en": "Nur Englisch",
  "settings.defaultTheme": "Standard-Thema",
  "settings.defaultLayout": "Standard-Layout",
  "settings.defaultSize": "Standard-Format",
  "settings.size.story": "Hochformat Stories",
  "settings.size.square": "Quadrat",
  "settings.size.landscape": "Querformat",
  "settings.autoLayout": "Thema & Layout täglich wechseln",
  "settings.usePhoto": "Fotohintergründe (Farbverlauf offline)",
  "settings.library": "Fotobibliothek",
  "settings.library.hint":
    "60 thematische Fotos; strenge Themenzuordnung. Offline: Farbverlauf.",
  "settings.library.current": "Aktuell",
  "settings.library.refresh": "Bibliothek aktualisieren",
  "settings.library.refreshing": "Aktualisiere…",
  "settings.save": "Speichern",
  "settings.saved": "Gespeichert",
  "settings.about": "Über",
  "settings.about.1": "Bibeltext lokal auf Canvas — keine KI-Schrift",
  "settings.about.2": "Mehrsprachige UI · zweisprachige Verse · Layouts",
  "settings.about.3": "Daten bleiben standardmäßig auf dem Gerät",
  "me.history": "Verlauf",
  "me.collection": "Favoriten",
  "me.settings": "Einstellungen",
  "explore.topics": "Themen",
  "explore.lectionary": "Lektionar",
  "today.meditation": "Besinnen",
  "today.createCustom": "Eigener Vers",
  "today.localRender": "Lokal gerendert",
  "studio.save": "Speichern",
  "studio.share": "Teilen",
  "studio.zh": "Chinesisch",
  "studio.zhEn": "ZH+EN",
  "studio.en": "Englisch",
  "studio.favorite": "Favorit",
  "studio.favorited": "Gespeichert",
  "studio.swap": "Neues Foto",
  "studio.swapping": "Wechsle…",
  "studio.adjust": "Anpassen",
  "studio.adjustClose": "Schließen",
  "studio.language": "Sprache",
  "studio.theme": "Thema",
  "studio.layout": "Layout",
  "studio.size": "Format",
  "studio.ready": "Vorbereitung…",
  "studio.generating": "Erzeuge…",
  "studio.generatingEn": "Englisch wird erzeugt…",
  "studio.swappingTheme": "Neues Foto im Thema…",
  "studio.done": "Fertig",
  "studio.doneSwap": "Foto gewechselt",
  "studio.doneGradient": "Farbverlauf",
  "studio.enNeedNet": "Englisch braucht Internet",
  "studio.fail": "Fehler — bitte erneut versuchen",
  "studio.saving": "Speichere Bild…",
  "studio.savedNative": "Gespeichert unter Dokumente/jinju-ri",
  "studio.savedWeb": "Download gestartet",
  "studio.savedLongpress": "Bild geöffnet — lange drücken zum Speichern",
  "studio.saveFail": "Speichern fehlgeschlagen — Vorschau lange drücken",
  "studio.favAdded": "Zu Favoriten hinzugefügt",
  "studio.favRemoved": "Aus Favoriten entfernt",
  "studio.swapThemeOnly": "Fotos wechseln nur innerhalb des Themas",
  "share.title": "Vers teilen",
  "share.close": "Schließen",
  "share.processing": "Bitte warten…",
  "share.fail": "Teilen fehlgeschlagen — zuerst speichern",
  "share.wechatNote":
    "WeChat-In-App-Browser kann Bilder nicht direkt senden. Vorschau lange drücken.",
  "share.whyTitle": "Warum WeChat scheitert?",
  "share.whyBody":
    "Webseiten dürfen keine lokalen Bilder direkt in WeChat posten. System-Teilen nutzen oder speichern und aus der Galerie senden.",
  "share.longpress": "Lange auf Bild drücken → in Album speichern",
  "share.tip":
    "Tipp: Systembrowser → Teilen → WeChat. Moments am besten im Quadratformat.",
  "history.badge": "Kürzlich",
  "history.title": "Verlauf",
  "history.empty": "Noch kein Verlauf. Erzeuge ein Bild unter Heute.",
  "history.clearConfirm": "Gesamten Verlauf löschen?",
  "collection.badge": "Favoriten",
  "collection.title": "Favoriten",
  "collection.empty": "Keine Favoriten. Tippe unter Heute/Erstellen auf Favorit.",
  "collection.remove": "Entfernen",
  "create.badge": "Eigen",
  "create.title": "Versbild erstellen",
  "create.intro":
    "Text und Stellenangabe eingeben. Bitte eine genaue Übersetzung verwenden.",
  "create.ref": "Stelle",
  "create.refPh": "z. B. Psalm 23,1",
  "create.body": "Verstext (chinesisch CUV)",
  "create.bodyPh": "Bibeltext einfügen…",
  "create.submit": "Bild erzeugen",
  "create.fillToday": "Heutigen Vers einfügen",
  "create.error": "Erzeugen fehlgeschlagen",
  "topics.badge": "Entdecken",
  "topics.title": "Nach Thema meditieren",
  "topics.intro":
    "Lebensthemen oder Frucht des Geistes wählen und ein Versbild machen.",
  "topics.fruitToday": "Frucht heute",
  "topics.fruitHint": "Neun Früchte rotieren täglich — Thema unten antippen",
  "topics.viewFruit": "Heutige Frucht-Verse anzeigen",
  "topics.fruitSection": "Frucht des Geistes (9)",
  "topics.lifeSection": "Lebensthemen",
  "topics.empty": "Keine Verse zu diesem Thema.",
  "topics.count": "Verse",
  "topics.countAll": "Gesamt",
  "topics.fruitIntro":
    "Die Frucht des Geistes ist Liebe, Freude, Friede, Geduld, Freundlichkeit, Güte, Treue, Sanftmut, Selbstbeherrschung.",
  "topics.fruitRef": "Galater 5,22-23",
  "lectionary.badge": "Lektionar",
  "lectionary.extend": "Saisonale Erweiterungslesungen diese Woche",
  "lectionary.year": "Jahr",
  "lectionary.note":
    "RCL-Zyklus A/B/C. Lokale Kompakttabelle mit saisonalem Fallback.",
  "theme.dawn": "Morgendämmerung",
  "theme.night": "Nacht",
  "theme.wilderness": "Wüste",
  "theme.mist": "Nebel",
  "theme.parchment": "Pergament",
  "theme.sanctuary": "Heiligtum",
  "theme.olive": "Olive",
  "theme.river": "Lebendiges Wasser",
  "template.center": "Zentriert",
  "template.center-quote": "Zitat-Poster",
  "template.top-bottom": "Oben eintauchen",
  "template.bottom": "Glaskarte",
  "template.left-right": "Seitenleiste",
  "template.left-rail": "Goldschiene",
  "topic.hope": "Hoffnung",
  "topic.comfort": "Trost",
  "topic.faith": "Glaube",
  "topic.strength": "Stärke",
  "topic.wisdom": "Weisheit",
  "topic.gratitude": "Dankbarkeit",
  "topic.presence": "Gegenwart",
  "topic.salvation": "Heil",
  "topic.love": "Liebe",
  "topic.joy": "Freude",
  "topic.peace": "Friede",
  "topic.patience": "Geduld",
  "topic.kindness": "Freundlichkeit",
  "topic.goodness": "Güte",
  "topic.faithfulness": "Treue",
  "topic.gentleness": "Sanftmut",
  "topic.self_control": "Selbstbeherrschung",
  "share.target.system": "System teilen",
  "share.target.save": "Bild speichern",
  "share.target.copy": "Vers kopieren",
  "share.target.wechat": "WeChat",
  "share.target.moments": "Moments",
  "share.target.xiaohongshu": "Xiaohongshu",
  "share.target.instagram": "Instagram",
  "share.target.x": "X (Twitter)",
  "share.target.facebook": "Facebook",
  "share.target.whatsapp": "WhatsApp",
  "share.hint.system": "System-Freigabe öffnen (empfohlen)",
  "share.hint.save": "In Album/Downloads speichern",
  "share.hint.copy": "Vers in Zwischenablage",
  "share.hint.wechat": "Speichern, dann aus WeChat-Album senden",
  "share.hint.moments": "Speichern, dann Moments posten",
  "share.hint.xiaohongshu": "Speichern, dann in Xiaohongshu hochladen",
  "share.hint.instagram": "Speichern, dann in Instagram posten",
  "share.hint.x": "Speichern, dann auf X posten",
  "share.hint.facebook": "Speichern, dann posten",
  "share.hint.whatsapp": "System teilen → WhatsApp",
  "share.size.current": "Aktuelle Größe",
  "share.size.square": "Quadrat 1080",
  "share.size.story": "Hochformat Stories",
  "share.size.land": "Querformat oder Quadrat",
  "share.size.any": "—",
  "share.msg.systemOpened": "System-Freigabe geöffnet. App wählen.",
  "share.msg.cancelled": "Teilen abgebrochen",
  "share.msg.unsupported": "System-Freigabe nicht verfügbar: Bild geladen, Text kopiert.",
  "share.msg.saved": "Bild gespeichert. Siehe Album/Downloads.",
  "share.msg.copied": "Vers in Zwischenablage kopiert.",
  "share.msg.copyFail": "Kopieren fehlgeschlagen.",
  "share.msg.wechatInApp": "In WeChat geöffnet: Bild gespeichert und Text kopiert.",
  "share.msg.pickWechat": "System-Freigabe geöffnet — WeChat wählen.",
  "share.msg.pickWhatsapp": "System-Freigabe geöffnet — WhatsApp wählen.",
  "share.msg.guide.wechat": "Bild gespeichert. WeChat → Chat → Album.",
  "share.msg.guide.moments": "Bild gespeichert. Moments aus Album.",
  "share.msg.guide.xiaohongshu": "Bild gespeichert. In Xiaohongshu hochladen.",
  "share.msg.guide.instagram": "Bild gespeichert. In Instagram wählen.",
  "share.msg.guide.x": "Bild gespeichert. Auf X posten.",
  "share.msg.guide.facebook": "Bild gespeichert. Auf Facebook posten.",
  "share.msg.guide.whatsapp": "Bild gespeichert. Per WhatsApp senden.",
  "share.msg.savedCopy": "Bild gespeichert und Text kopiert.",
  "share.dialogTitle": "Teilen",
  "share.caption.cuv": "CUV",
  "share.caption.noEn": "Chinesisch; noch kein Englisch",
  "share.caption.tag": "#Serein",
  "image.kicker": "SEREIN",
};

const fr: Dict = {
  "app.name": "Serein",
  "app.tagline": "Une ligne calme par jour",
  "nav.today": "Aujourd'hui",
  "nav.explore": "Explorer",
  "nav.create": "Créer",
  "nav.me": "Moi",
  "nav.main": "Navigation principale",
  "common.refresh": "Actualiser",
  "common.open": "Ouvrir",
  "common.delete": "Supprimer",
  "common.clear": "Vider",
  "common.all": "Tous",
  "common.preview": "Aperçu",
  "common.generate": "Générer",
  "common.loading": "Chargement…",
  "common.cuv": "CUV",
  "common.verses": "versets",
  "settings.badge": "Préférences",
  "settings.title": "Réglages",
  "settings.intro":
    "Apparence, langue et options d'image sont enregistrées sur l'appareil. L'interface change immédiatement.",
  "settings.appearance": "Apparence",
  "settings.appearance.system": "Système",
  "settings.appearance.light": "Clair",
  "settings.appearance.dark": "Sombre",
  "settings.appLanguage": "Langue de l'application",
  "settings.verseLanguage": "Langue du verset (image)",
  "settings.verse.zhEn": "Chinois + anglais",
  "settings.verse.zh": "Chinois seul",
  "settings.verse.en": "Anglais seul",
  "settings.defaultTheme": "Thème par défaut",
  "settings.defaultLayout": "Mise en page par défaut",
  "settings.defaultSize": "Format par défaut",
  "settings.size.story": "Portrait Stories",
  "settings.size.square": "Carré",
  "settings.size.landscape": "Paysage",
  "settings.autoLayout": "Rotation quotidienne thème & mise en page",
  "settings.usePhoto": "Fonds photo (dégradé hors ligne)",
  "settings.library": "Bibliothèque photo",
  "settings.library.hint":
    "60 photos thématiques ; correspondance stricte. Hors ligne : dégradé.",
  "settings.library.current": "Actuel",
  "settings.library.refresh": "Actualiser la bibliothèque",
  "settings.library.refreshing": "Mise à jour…",
  "settings.save": "Enregistrer",
  "settings.saved": "Enregistré",
  "settings.about": "À propos",
  "settings.about.1": "Texte composé localement sur canvas — pas d'IA pour les lettres",
  "settings.about.2": "Interface multilingue · versets bilingues · mises en page",
  "settings.about.3": "Données stockées sur l'appareil par défaut",
  "me.history": "Historique",
  "me.collection": "Favoris",
  "me.settings": "Réglages",
  "explore.topics": "Thèmes",
  "explore.lectionary": "Lectionnaire",
  "today.meditation": "Méditer",
  "today.createCustom": "Verset personnalisé",
  "today.localRender": "Rendu local",
  "studio.save": "Enregistrer",
  "studio.share": "Partager",
  "studio.zh": "Chinois",
  "studio.zhEn": "ZH+EN",
  "studio.en": "Anglais",
  "studio.favorite": "Favori",
  "studio.favorited": "Enregistré",
  "studio.swap": "Autre photo",
  "studio.swapping": "Changement…",
  "studio.adjust": "Ajuster",
  "studio.adjustClose": "Fermer",
  "studio.language": "Langue",
  "studio.theme": "Thème",
  "studio.layout": "Mise en page",
  "studio.size": "Format",
  "studio.ready": "Préparation…",
  "studio.generating": "Génération…",
  "studio.generatingEn": "Génération en anglais…",
  "studio.swappingTheme": "Nouvelle photo du thème…",
  "studio.done": "Terminé",
  "studio.doneSwap": "Photo mise à jour",
  "studio.doneGradient": "dégradé",
  "studio.enNeedNet": "L'anglais nécessite le réseau",
  "studio.fail": "Échec — réessayez",
  "studio.saving": "Enregistrement…",
  "studio.savedNative": "Enregistré dans Documents/jinju-ri",
  "studio.savedWeb": "Téléchargement démarré",
  "studio.savedLongpress": "Image ouverte — appui long pour enregistrer",
  "studio.saveFail": "Échec — appui long sur l'aperçu",
  "studio.favAdded": "Ajouté aux favoris",
  "studio.favRemoved": "Retiré des favoris",
  "studio.swapThemeOnly": "Les photos tournent uniquement dans le thème actuel",
  "share.title": "Partager le verset",
  "share.close": "Fermer",
  "share.processing": "Traitement…",
  "share.fail": "Échec du partage — enregistrez d'abord l'aperçu",
  "share.wechatNote":
    "Le navigateur WeChat ne peut pas envoyer d'images directement. Appui long sur l'aperçu.",
  "share.whyTitle": "Pourquoi WeChat échoue ?",
  "share.whyBody":
    "Les pages web ne peuvent pas poster d'images locales dans WeChat. Utilisez le partage système ou enregistrez puis envoyez depuis l'album.",
  "share.longpress": "Appui long sur l'image → enregistrer dans l'album",
  "share.tip":
    "Astuce : navigateur système → Partager → WeChat. Moments : format carré recommandé.",
  "history.badge": "Récent",
  "history.title": "Historique",
  "history.empty": "Pas encore d'historique. Générez une image dans Aujourd'hui.",
  "history.clearConfirm": "Effacer tout l'historique ?",
  "collection.badge": "Favoris",
  "collection.title": "Favoris",
  "collection.empty":
    "Aucun favori. Appuyez sur Favori dans Aujourd'hui ou Créer.",
  "collection.remove": "Retirer",
  "create.badge": "Perso",
  "create.title": "Créer une image de verset",
  "create.intro":
    "Saisissez le texte et la référence. Utilisez une traduction fidèle.",
  "create.ref": "Référence",
  "create.refPh": "ex. Psaume 23:1",
  "create.body": "Texte (chinois CUV)",
  "create.bodyPh": "Collez le texte biblique…",
  "create.submit": "Générer l'image",
  "create.fillToday": "Utiliser le verset du jour",
  "create.error": "Impossible de générer",
  "topics.badge": "Explorer",
  "topics.title": "Méditer par thème",
  "topics.intro":
    "Choisissez un thème de vie ou un fruit de l'Esprit, puis créez une carte.",
  "topics.fruitToday": "Fruit du jour",
  "topics.fruitHint": "Neuf fruits en rotation — touchez un thème ci-dessous",
  "topics.viewFruit": "Voir les versets du fruit du jour",
  "topics.fruitSection": "Fruit de l'Esprit (9)",
  "topics.lifeSection": "Thèmes de vie",
  "topics.empty": "Aucun verset pour ce thème.",
  "topics.count": "versets",
  "topics.countAll": "Total",
  "topics.fruitIntro":
    "Le fruit de l'Esprit est amour, joie, paix, patience, bonté, bienveillance, fidélité, douceur, maîtrise de soi.",
  "topics.fruitRef": "Galates 5:22-23",
  "lectionary.badge": "Lectionnaire",
  "lectionary.extend": "Lectures d'extension saisonnière cette semaine",
  "lectionary.year": "Année",
  "lectionary.note":
    "Lectionnaire commun révisé cycles A/B/C. Table locale compacte avec repli saisonnier.",
  "theme.dawn": "Aube",
  "theme.night": "Nuit",
  "theme.wilderness": "Désert",
  "theme.mist": "Brume",
  "theme.parchment": "Parchemin",
  "theme.sanctuary": "Sanctuaire",
  "theme.olive": "Olivier",
  "theme.river": "Eau vive",
  "template.center": "Centré",
  "template.center-quote": "Affiche citation",
  "template.top-bottom": "Immersion haut",
  "template.bottom": "Carte verre",
  "template.left-right": "Panneau latéral",
  "template.left-rail": "Rail doré",
  "topic.hope": "Espérance",
  "topic.comfort": "Consolation",
  "topic.faith": "Foi",
  "topic.strength": "Force",
  "topic.wisdom": "Sagesse",
  "topic.gratitude": "Gratitude",
  "topic.presence": "Présence",
  "topic.salvation": "Salut",
  "topic.love": "Amour",
  "topic.joy": "Joie",
  "topic.peace": "Paix",
  "topic.patience": "Patience",
  "topic.kindness": "Bonté",
  "topic.goodness": "Bienveillance",
  "topic.faithfulness": "Fidélité",
  "topic.gentleness": "Douceur",
  "topic.self_control": "Maîtrise de soi",
  "share.target.system": "Partage système",
  "share.target.save": "Enregistrer l'image",
  "share.target.copy": "Copier le verset",
  "share.target.wechat": "WeChat",
  "share.target.moments": "Moments",
  "share.target.xiaohongshu": "Xiaohongshu",
  "share.target.instagram": "Instagram",
  "share.target.x": "X (Twitter)",
  "share.target.facebook": "Facebook",
  "share.target.whatsapp": "WhatsApp",
  "share.hint.system": "Ouvrir le partage système (recommandé)",
  "share.hint.save": "Enregistrer dans l'album/téléchargements",
  "share.hint.copy": "Copier le verset",
  "share.hint.wechat": "Enregistrer puis envoyer depuis WeChat",
  "share.hint.moments": "Enregistrer puis publier dans Moments",
  "share.hint.xiaohongshu": "Enregistrer puis téléverser",
  "share.hint.instagram": "Enregistrer puis publier sur Instagram",
  "share.hint.x": "Enregistrer puis publier sur X",
  "share.hint.facebook": "Enregistrer puis publier",
  "share.hint.whatsapp": "Partage système → WhatsApp",
  "share.size.current": "Taille actuelle",
  "share.size.square": "Carré 1080",
  "share.size.story": "Portrait Stories",
  "share.size.land": "Paysage ou carré",
  "share.size.any": "—",
  "share.msg.systemOpened": "Partage système ouvert. Choisissez une app.",
  "share.msg.cancelled": "Partage annulé",
  "share.msg.unsupported": "Partage système indisponible : image téléchargée et texte copié.",
  "share.msg.saved": "Image enregistrée. Voir album/téléchargements.",
  "share.msg.copied": "Verset copié dans le presse-papiers.",
  "share.msg.copyFail": "Échec de la copie.",
  "share.msg.wechatInApp": "Ouvert dans WeChat : image enregistrée et texte copié.",
  "share.msg.pickWechat": "Partage système ouvert — choisissez WeChat.",
  "share.msg.pickWhatsapp": "Partage système ouvert — choisissez WhatsApp.",
  "share.msg.guide.wechat": "Image enregistrée. WeChat → chat → album.",
  "share.msg.guide.moments": "Image enregistrée. Moments depuis l'album.",
  "share.msg.guide.xiaohongshu": "Image enregistrée. Téléverser dans Xiaohongshu.",
  "share.msg.guide.instagram": "Image enregistrée. Choisir dans Instagram.",
  "share.msg.guide.x": "Image enregistrée. Publier sur X.",
  "share.msg.guide.facebook": "Image enregistrée. Publier sur Facebook.",
  "share.msg.guide.whatsapp": "Image enregistrée. Envoyer via WhatsApp.",
  "share.msg.savedCopy": "Image enregistrée et texte copié.",
  "share.dialogTitle": "Partager",
  "share.caption.cuv": "CUV",
  "share.caption.noEn": "Chinois ; pas d'anglais encore",
  "share.caption.tag": "#Serein",
  "image.kicker": "SEREIN",
};

export const MESSAGES: Record<AppLocale, Dict> = { zh, en, de, fr };

export function translate(locale: AppLocale, key: MessageKey): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.zh[key] ?? key;
}

const THEME_KEYS = new Set([
  "dawn",
  "night",
  "wilderness",
  "mist",
  "parchment",
  "sanctuary",
  "olive",
  "river",
]);

const TEMPLATE_KEYS = new Set([
  "center",
  "center-quote",
  "top-bottom",
  "bottom",
  "left-right",
  "left-rail",
]);

const TOPIC_KEYS = new Set([
  "hope",
  "comfort",
  "faith",
  "strength",
  "wisdom",
  "gratitude",
  "presence",
  "salvation",
  "love",
  "joy",
  "peace",
  "patience",
  "kindness",
  "goodness",
  "faithfulness",
  "gentleness",
  "self_control",
]);

export function themeLabel(locale: AppLocale, themeId: string): string {
  if (THEME_KEYS.has(themeId)) {
    return translate(locale, `theme.${themeId}` as MessageKey);
  }
  return themeId;
}

export function templateLabel(locale: AppLocale, templateId: string): string {
  if (TEMPLATE_KEYS.has(templateId)) {
    return translate(locale, `template.${templateId}` as MessageKey);
  }
  return templateId;
}

export function topicLabel(locale: AppLocale, topicId: string): string {
  if (TOPIC_KEYS.has(topicId)) {
    return translate(locale, `topic.${topicId}` as MessageKey);
  }
  return topicId;
}

export function localeTag(locale: AppLocale): string {
  if (locale === "zh") return "zh-CN";
  if (locale === "de") return "de-DE";
  if (locale === "fr") return "fr-FR";
  return "en-US";
}
