"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactEventHandler } from "react";
import GameBreadcrumb from "../_components/GameBreadcrumb";
import GameFrameWithControls from "../_components/GameFrameWithControls";
import PageShell from "../_components/PageShell";
import gameStyles from "../styles/game-page.module.css";
import styles from "./gba.module.css";

type GbaEmulatorMessage =
  | { source: "gba-emulator"; type: "gba-status"; message?: string }
  | { source: "gba-emulator"; type: "gba-status-clear" }
  | {
      source: "gba-emulator";
      type: "gba-download";
      fileName: string;
      mimeType?: string;
      buffer: ArrayBuffer;
    }
  | {
      source: "gba-emulator";
      type: "gba-save-result";
      requestId?: string;
      ok: boolean;
      message?: string;
    }
  | {
      source: "gba-emulator";
      type: "gba-import-save-result";
      ok: boolean;
      message?: string;
    };

type SaveStatus = {
  tone: "info" | "success" | "error";
  message: string;
};

export default function GbaClient() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const pendingSaveRequestRef = useRef<{
    requestId: string;
    resolve: (result: { ok: boolean; message?: string }) => void;
    timeoutId: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus | null>(null);
  const [isSavingToBrowser, setIsSavingToBrowser] = useState(false);
  const [isImportingSave, setIsImportingSave] = useState(false);

  const postToEmulator = useCallback(
    (payload: Record<string, unknown>) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow) {
        setSaveStatus({
          tone: "error",
          message: "The emulator frame is not ready yet. Please wait a moment and try again.",
        });
        return false;
      }

      frameWindow.postMessage(
        {
          source: "gba-page",
          ...payload,
        },
        window.location.origin,
      );

      return true;
    },
    [],
  );

  const triggerDownload = useCallback((fileName: string, mimeType: string | undefined, buffer: ArrayBuffer) => {
    const blob = new Blob([buffer], { type: mimeType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 0);
  }, []);

  const handleFrameLoad: ReactEventHandler<HTMLIFrameElement> = useCallback(() => {
    setErrorMessage(null);
    setSaveStatus(null);
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent<GbaEmulatorMessage>) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      if (!data || data.source !== "gba-emulator") return;

      if (data.type === "gba-status") {
        setIsImportingSave(false);
        setErrorMessage(data.message || "The emulator hit an unexpected error.");
        return;
      }

      if (data.type === "gba-status-clear") {
        setErrorMessage(null);
        return;
      }

      if (data.type === "gba-download") {
        triggerDownload(data.fileName, data.mimeType, data.buffer);
        if (/\.(sav|srm)$/i.test(data.fileName)) {
          setSaveStatus({
            tone: "success",
            message: `Downloaded ${data.fileName}. Keep this backup if browser storage ever fails.`,
          });
        }
        return;
      }

      if (data.type === "gba-save-result") {
        const pendingSaveRequest = pendingSaveRequestRef.current;
        if (pendingSaveRequest && pendingSaveRequest.requestId === data.requestId) {
          window.clearTimeout(pendingSaveRequest.timeoutId);
          pendingSaveRequest.resolve({ ok: data.ok, message: data.message });
          pendingSaveRequestRef.current = null;
        }
        return;
      }

      if (data.type === "gba-import-save-result") {
        setIsImportingSave(false);
        setSaveStatus({
          tone: data.ok ? "success" : "error",
          message:
            data.message ||
            (data.ok
              ? "Save imported successfully. FireRed is restarting to load the new save."
              : "The imported save could not be applied. Please try a different file."),
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      const pendingSaveRequest = pendingSaveRequestRef.current;
      if (pendingSaveRequest) {
        window.clearTimeout(pendingSaveRequest.timeoutId);
        pendingSaveRequestRef.current = null;
      }
      window.removeEventListener("message", handleMessage);
    };
  }, [triggerDownload]);

  const handleSaveToBrowser = useCallback(async () => {
    const requestId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `gba-save-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    setIsSavingToBrowser(true);
    setSaveStatus({
      tone: "info",
      message: "Saving to browser storage… please keep this tab open until the confirmation appears.",
    });
    setErrorMessage(null);

    const sent = postToEmulator({
      type: "gba-persist-save-request",
      requestId,
    });

    if (!sent) {
      setIsSavingToBrowser(false);
      return;
    }

    const result = await new Promise<{ ok: boolean; message?: string }>((resolve) => {
      const timeoutId = window.setTimeout(() => {
        if (pendingSaveRequestRef.current?.requestId === requestId) {
          pendingSaveRequestRef.current = null;
        }
        resolve({
          ok: false,
          message: "The save confirmation timed out. Export a backup save if you need a guaranteed fallback.",
        });
      }, 15000);

      pendingSaveRequestRef.current = {
        requestId,
        resolve,
        timeoutId,
      };
    });

    setIsSavingToBrowser(false);
    setSaveStatus({
      tone: result.ok ? "success" : "error",
      message:
        result.message ||
        (result.ok
          ? "Save synced to this browser. It is now safe to close the tab."
          : "The save could not be synced to this browser."),
    });
  }, [postToEmulator]);

  const handleExportSave = useCallback(() => {
    setSaveStatus({
      tone: "info",
      message: "Preparing your save download…",
    });
    setErrorMessage(null);
    postToEmulator({
      type: "gba-export-save-request",
    });
  }, [postToEmulator]);

  const handleImportSaveButtonClick = useCallback(() => {
    importInputRef.current?.click();
  }, []);

  const handleImportSaveChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) return;

      setIsImportingSave(true);
      setSaveStatus({
        tone: "info",
        message: `Importing ${file.name} and syncing it to browser storage…`,
      });
      setErrorMessage(null);

      const sent = postToEmulator({
        type: "gba-import-save-file",
        file,
      });

      if (!sent) {
        setIsImportingSave(false);
      }
    },
    [postToEmulator],
  );

  return (
    <PageShell>
      <main className={gameStyles.wrapperWide}>
        <header className={gameStyles.header}>
          <GameBreadcrumb current="Pokémon FireRed" />
          <h1 className={gameStyles.title}>Pokémon FireRed</h1>
          <p className={gameStyles.subtitle}>Pokémon FireRed loads automatically, so you can jump straight into Kanto.</p>
        </header>

        <section className={styles.gameSection} aria-label="Pokémon FireRed game">
          <GameFrameWithControls
            iframeRef={iframeRef}
            iframeSrc="/emulators/gba/index.html"
            iframeTitle="Pokémon FireRed"
            allow="autoplay; gamepad; fullscreen"
            allowFullScreen
            loading="eager"
            showFullscreenButton
            frameClassName={styles.gbaFrame}
            onLoad={handleFrameLoad}
          />

          {errorMessage ? (
            <p className={styles.errorStatus} role="alert">
              {errorMessage}
            </p>
          ) : null}
        </section>

        <section className={styles.savePanel} aria-label="Pokémon FireRed save tools">
          <div className={styles.saveActions}>
            <button
              type="button"
              className={styles.primaryAction}
              onClick={handleSaveToBrowser}
              disabled={isSavingToBrowser || isImportingSave}
            >
              {isSavingToBrowser ? "Saving…" : "Save to Browser"}
            </button>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleExportSave}
              disabled={isSavingToBrowser || isImportingSave}
            >
              Export Save
            </button>
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={handleImportSaveButtonClick}
              disabled={isSavingToBrowser || isImportingSave}
            >
              {isImportingSave ? "Importing…" : "Import Save"}
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".sav,.srm,application/octet-stream"
              className={styles.hiddenInput}
              onChange={handleImportSaveChange}
            />
          </div>

          <p className={styles.saveHint}>
            Use <strong>Save to Browser</strong> before closing the tab. Keep an exported save file as a manual backup in
            case browser storage fails.
          </p>

          {saveStatus ? (
            <p
              className={[
                styles.saveStatus,
                saveStatus.tone === "success"
                  ? styles.saveStatusSuccess
                  : saveStatus.tone === "error"
                    ? styles.saveStatusError
                    : styles.saveStatusInfo,
              ].join(" ")}
              role={saveStatus.tone === "error" ? "alert" : "status"}
            >
              {saveStatus.message}
            </p>
          ) : null}
        </section>

        <section className={styles.infoGrid} aria-label="Pokémon FireRed notes">
          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>FireRed Controls</h2>
            <ul className={styles.infoList}>
              <li>
                <kbd className={styles.kbd}>Z</kbd> confirms actions, <kbd className={styles.kbd}>X</kbd> cancels actions
              </li>
              <li>
                <kbd className={styles.kbd}>Enter</kbd> opens the menu, <kbd className={styles.kbd}>Shift</kbd> works as Select
              </li>
              <li>Arrow keys move your character and the menu cursor</li>
            </ul>
          </article>

          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>Your FireRed Save</h2>
            <ol className={styles.infoList}>
              <li>
                <strong>Save inside FireRed first.</strong> Open the in-game menu and use the normal Pokémon save option.
              </li>
              <li>
                <strong>Click “Save to Browser” before closing the tab.</strong> Wait until the page tells you the save
                synced successfully.
              </li>
              <li>
                <strong>Click “Export Save” to keep a backup file.</strong> This downloads a <code>.sav</code> file to your
                device in case browser storage fails later.
              </li>
              <li>
                <strong>If your progress ever disappears, click “Import Save”.</strong> Choose the backup <code>.sav</code>{" "}
                file to restore your game.
              </li>
            </ol>
          </article>

          <article className={styles.infoCard}>
            <h2 className={styles.infoTitle}>ROM Notice</h2>
            <p className={styles.infoText}>
              Play Pokémon FireRed only if you have the right to use that ROM, and only replace it with backups you are
              legally allowed to run.
            </p>
          </article>
        </section>
      </main>
    </PageShell>
  );
}
