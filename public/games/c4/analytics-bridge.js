/* Privacy-safe C4 gameplay milestones for the Billy Bob Games parent page. */
(function () {
  "use strict";

  var currentMode = "unknown";
  var roundActive = false;
  var roundComplete = false;
  var firstMoveSent = false;
  var errorSent = false;

  function emit(name, params) {
    if (window.parent === window) return;
    window.parent.postMessage(
      {
        source: "billybob-game-analytics",
        name: name,
        params: params || {},
      },
      window.location.origin,
    );
  }

  function safeMode(value) {
    return typeof value === "string" ? value.replace(/-/g, "_") : "unknown";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.querySelector(".game-settings-form");
    var canvas = document.querySelector(".section-canvas");
    var messageDialog = document.querySelector(".message-body");
    var playAgain = document.querySelector(".statusbox-button-play-again");
    var endGame = document.querySelector(".statusbox-button-back");

    form?.addEventListener("submit", function () {
      currentMode = safeMode(new FormData(form).get("mode"));
      roundActive = true;
      roundComplete = false;
      firstMoveSent = false;
      emit("game_round_start", { mode: currentMode });
    });

    canvas?.addEventListener("click", function () {
      if (!roundActive || roundComplete || firstMoveSent) return;
      firstMoveSent = true;
      emit("game_first_move", { mode: currentMode });
    });

    playAgain?.addEventListener("click", function () {
      emit("game_round_restart", { mode: currentMode });
      roundActive = true;
      roundComplete = false;
      firstMoveSent = false;
    });

    endGame?.addEventListener("click", function () {
      if (roundActive && !roundComplete) emit("game_round_abandon", { mode: currentMode });
      roundActive = false;
    });

    if (messageDialog) {
      var observer = new MutationObserver(function () {
        var title = messageDialog.querySelector("#message-title")?.textContent || "";
        if (!messageDialog.hasAttribute("open") || !title.startsWith("Thank you for playing") || roundComplete) return;

        var result = messageDialog.querySelector("p")?.textContent || "";
        roundComplete = true;
        roundActive = false;
        emit("game_round_complete", {
          mode: currentMode,
          outcome: result.toLowerCase().includes("draw") ? "draw" : "win",
        });
      });
      observer.observe(messageDialog, { attributes: true, childList: true, subtree: true });
    }
  });

  window.addEventListener("error", function () {
    if (errorSent) return;
    errorSent = true;
    emit("game_error", { reason: "script_error" });
  });

  window.addEventListener("unhandledrejection", function () {
    if (errorSent) return;
    errorSent = true;
    emit("game_error", { reason: "unhandled_rejection" });
  });
})();
