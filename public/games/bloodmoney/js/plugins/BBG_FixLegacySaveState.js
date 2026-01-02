/*:
 * @plugindesc BBG: Fix legacy save state for web embeds (variable 15 / variable HUD gauge).
 * @help
 * This game is embedded on the web where some assets may be missing in legacy builds.
 * Old save files can preserve unexpected values (e.g. variable #15) that cause the game
 * to request images that don't exist (e.g. img/system/msgimg_1.png).
 *
 * This plugin normalizes that legacy state on:
 * - New game
 * - Save load
 */
(function () {
  function normalizeLegacyState() {
    if (typeof $gameVariables !== "undefined" && $gameVariables) {
      // GALV_MessageBackground uses variable 15 to pick img/system/msgimg_<n>.png.
      // The original package only ships msgimg_0.png, so clamp to 0.
      try {
        $gameVariables.setValue(15, 0);
      } catch (e) {
        // ignore
      }
    }

    // Prevent legacy saves from enabling gauge images for variable HUDs.
    if (typeof $gameSystem !== "undefined" && $gameSystem && Array.isArray($gameSystem._variableHudData)) {
      for (var i = 0; i < $gameSystem._variableHudData.length; i++) {
        var hud = $gameSystem._variableHudData[i];
        if (hud) hud.gauge = false;
      }
    }
  }

  var _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function () {
    _DataManager_setupNewGame.call(this);
    normalizeLegacyState();
  };

  var _DataManager_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function (contents) {
    _DataManager_extractSaveContents.call(this, contents);
    normalizeLegacyState();
  };
})();

