const fs = require("fs");
const p = "src/core/i18n/locales.ts";
let s = fs.readFileSync(p, "utf8");

const newKeys = `
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
`;

if (!s.includes('"share.target.system"')) {
  s = s.replace(
    '  | "topic.self_control";',
    '  | "topic.self_control"' + newKeys + ";",
  );
}

const packs = [
  [
    '"topic.self_control": "节制"',
    `
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
  "share.caption.tag": "#金句日",
  "image.kicker": "今日金句  ·  DAILY VERSE"`,
  ],
  [
    '"topic.self_control": "Self-control"',
    `
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
  "share.caption.tag": "#JinjuDay",
  "image.kicker": "DAILY VERSE"`,
  ],
  [
    '"topic.self_control": "Selbstbeherrschung"',
    `
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
  "share.caption.tag": "#JinjuTag",
  "image.kicker": "TAGESVERS"`,
  ],
  [
    '"topic.self_control": "Maîtrise de soi"',
    `
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
  "share.caption.tag": "#JinjuJour",
  "image.kicker": "VERSET DU JOUR"`,
  ],
];

if (!s.includes('"share.target.system": "System share"')) {
  for (const [marker, extra] of packs) {
    if (!s.includes(marker)) throw new Error("missing " + marker);
    s = s.replace(marker, marker + "," + extra);
  }
}

fs.writeFileSync(p, s);
console.log("ok", s.includes('"image.kicker"'));
