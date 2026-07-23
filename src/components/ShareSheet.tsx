import { useEffect, useState } from "react";
import type { BilingualMode, Verse } from "@/core/types";
import {
  SOCIAL_TARGETS,
  detectRuntime,
  type SocialTarget,
} from "@/core/share/platform";
import { shareToTarget } from "@/core/share/service";
import { useI18n, type MessageKey } from "@/core/i18n";

export interface ShareSheetProps {
  open: boolean;
  onClose: () => void;
  blob: Blob;
  dataUrl: string;
  filename: string;
  verse: Verse;
  mode: BilingualMode;
}

const TARGET_NAME: Record<SocialTarget, MessageKey> = {
  system: "share.target.system",
  save: "share.target.save",
  copy: "share.target.copy",
  wechat: "share.target.wechat",
  moments: "share.target.moments",
  xiaohongshu: "share.target.xiaohongshu",
  instagram: "share.target.instagram",
  x: "share.target.x",
  facebook: "share.target.facebook",
  whatsapp: "share.target.whatsapp",
};

const TARGET_HINT: Record<SocialTarget, MessageKey> = {
  system: "share.hint.system",
  save: "share.hint.save",
  copy: "share.hint.copy",
  wechat: "share.hint.wechat",
  moments: "share.hint.moments",
  xiaohongshu: "share.hint.xiaohongshu",
  instagram: "share.hint.instagram",
  x: "share.hint.x",
  facebook: "share.hint.facebook",
  whatsapp: "share.hint.whatsapp",
};

const TARGET_SIZE: Record<SocialTarget, MessageKey> = {
  system: "share.size.current",
  save: "share.size.current",
  copy: "share.size.any",
  wechat: "share.size.square",
  moments: "share.size.square",
  xiaohongshu: "share.size.square",
  instagram: "share.size.story",
  x: "share.size.land",
  facebook: "share.size.land",
  whatsapp: "share.size.current",
};

export default function ShareSheet({
  open,
  onClose,
  blob,
  dataUrl,
  filename,
  verse,
  mode,
}: ShareSheetProps) {
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const env = detectRuntime();

  useEffect(() => {
    if (!open) {
      setMessage("");
      setBusy(false);
    } else if (env === "wechat") {
      setMessage(t("share.wechatNote"));
    }
  }, [open, env, t, locale]);

  if (!open) return null;

  const run = async (target: SocialTarget) => {
    setBusy(true);
    setMessage(t("share.processing"));
    try {
      let out = blob;
      if (!out || out.size < 64) {
        const res = await fetch(dataUrl);
        out = await res.blob();
      }
      const r = await shareToTarget({
        target,
        blob: out,
        filename: filename.replace(/[^\w.\-]+/g, "_") || "jinju.png",
        verse,
        mode,
        dataUrl,
      });
      setMessage(r.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : t("share.fail"));
    } finally {
      setBusy(false);
    }
  };

  const isError =
    message === t("share.fail") ||
    message === t("share.msg.cancelled") ||
    message === t("share.msg.copyFail");

  return (
    <div
      className="share-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
      onClick={onClose}
    >
      <div className="share-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="share-sheet-head">
          <h2 id="share-title">{t("share.title")}</h2>
          <button type="button" className="btn ghost compact" onClick={onClose}>
            {t("share.close")}
          </button>
        </div>

        <p className="muted small share-why">
          <strong>{t("share.whyTitle")}</strong> {t("share.whyBody")}
        </p>

        <div className="share-preview-wrap">
          <img
            src={dataUrl}
            alt={t("share.title")}
            className="share-preview-img"
          />
          <p className="muted small" style={{ textAlign: "center" }}>
            {t("share.longpress")}
          </p>
        </div>

        <div className="share-grid">
          {SOCIAL_TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              className="share-target-btn"
              disabled={busy}
              onClick={() => void run(target.id)}
              title={t(TARGET_HINT[target.id])}
            >
              <span className="share-target-name">
                {t(TARGET_NAME[target.id])}
              </span>
              <span className="share-target-size">
                {t(TARGET_SIZE[target.id])}
              </span>
            </button>
          ))}
        </div>

        {message ? (
          <p
            className={isError ? "status-line error" : "status-line"}
            style={{ marginTop: "0.75rem" }}
          >
            {message}
          </p>
        ) : null}

        <p className="muted small" style={{ marginTop: "0.75rem" }}>
          {t("share.tip")}
        </p>
      </div>
    </div>
  );
}
