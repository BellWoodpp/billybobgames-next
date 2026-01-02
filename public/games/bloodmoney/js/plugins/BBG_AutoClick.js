/*:
 * @plugindesc BBG: Auto-click toggle (text button).
 * @help
 * Adds a small on-screen toggle on the map scene.
 * When enabled, it periodically triggers Common Event #3 ("Click"),
 * matching the game's existing click logic (money, SFX, animations, etc.).
 */
(function () {
  var COMMON_EVENT_ID = 3; // CommonEvents.json -> name: "Click"
  var INTERVAL_FRAMES = 3; // desired cadence (~20/s at 60fps), limited by event runtime

  function ensureState() {
    if ($gameSystem && typeof $gameSystem._bbgAutoClickEnabled === "undefined") {
      $gameSystem._bbgAutoClickEnabled = false;
    }
  }

  function toggle() {
    ensureState();
    $gameSystem._bbgAutoClickEnabled = !$gameSystem._bbgAutoClickEnabled;
  }

  function enabled() {
    ensureState();
    return !!$gameSystem._bbgAutoClickEnabled;
  }

  function isSafeToAutoClick() {
    if (!$gameTemp || !$gameSystem || !$gameMap) return false;
    if ($gameMap.isEventRunning && $gameMap.isEventRunning()) return false;
    if ($gameTemp.isCommonEventReserved && $gameTemp.isCommonEventReserved()) return false;
    return true;
  }

  function Window_BBG_AutoClick() {
    this.initialize.apply(this, arguments);
  }

  Window_BBG_AutoClick.prototype = Object.create(Window_Base.prototype);
  Window_BBG_AutoClick.prototype.constructor = Window_BBG_AutoClick;

  Window_BBG_AutoClick.prototype.initialize = function () {
    var width = 240;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.opacity = 200;
    this._lastState = null;
    this.refresh();
  };

  Window_BBG_AutoClick.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    ensureState();

    var state = enabled();
    if (state !== this._lastState) this.refresh();

    if (!this.visible || !this.isOpen()) return;
    if (TouchInput.isTriggered() && this._hitTest(TouchInput.x, TouchInput.y)) {
      toggle();
      this.refresh();
      TouchInput.clear();
    }
  };

  Window_BBG_AutoClick.prototype._hitTest = function (x, y) {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  };

  Window_BBG_AutoClick.prototype.refresh = function () {
    this.contents.clear();
    this._lastState = enabled();
    var label = this._lastState ? "Auto Click:On" : "Auto Click:Off";
    this.changeTextColor(this._lastState ? this.textColor(3) : this.textColor(7));
    this.drawText(label, 0, 0, this.contentsWidth(), "center");
    this.resetTextColor();
  };

  var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function () {
    _Scene_Map_createAllWindows.call(this);
    ensureState();
    this._bbgAutoClickWindow = new Window_BBG_AutoClick();
    this.addWindow(this._bbgAutoClickWindow);
  };

  Scene_Map.prototype._bbgPositionAutoClickWindow = function () {
    if (!this._bbgAutoClickWindow) return;

    // Anchor under the money HUD (MOG_VariableHud HUD #1 -> index 0).
    var hud = this._variableHud && this._variableHud[0];
    if (hud) {
      var hudW = 0;
      var hudH = 0;
      if (hud._layout) {
        hudW = hud._layout.width || 0;
        hudH = hud._layout.height || 0;
      }
      if (!hudW) hudW = hud.width || 0;
      if (!hudH) hudH = hud.height || 0;

      if (hudW > 0 && hudH > 0) {
        this._bbgAutoClickWindow.x = hud.x + hudW - this._bbgAutoClickWindow.width;
        this._bbgAutoClickWindow.y = hud.y + hudH + 6;
        return;
      }
    }

    // Fallback: top-right.
    this._bbgAutoClickWindow.x = Graphics.boxWidth - this._bbgAutoClickWindow.width - 10;
    this._bbgAutoClickWindow.y = 10;
  };

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    ensureState();

    this._bbgPositionAutoClickWindow();

    if (!enabled()) return;
    if (!isSafeToAutoClick()) return;

    $gameTemp._bbgAutoClickCounter = ($gameTemp._bbgAutoClickCounter || 0) + 1;
    if ($gameTemp._bbgAutoClickCounter >= INTERVAL_FRAMES) {
      $gameTemp._bbgAutoClickCounter = 0;
      $gameTemp.reserveCommonEvent(COMMON_EVENT_ID);
    }
  };
})();
