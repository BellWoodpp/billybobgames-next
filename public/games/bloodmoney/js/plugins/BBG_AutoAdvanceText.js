/*:
 * @plugindesc BBG: Auto-advance dialogue when text ends (web build).
 * @help
 * Adds a small on-screen toggle on the map scene.
 * When enabled, the message window will automatically advance after
 * reaching the "pause" state (end of page / waiting for input).
 *
 * Safety: it will NOT auto-confirm choice/number/item selection windows.
 */
(function () {
  var BBG = (window.BBG = window.BBG || {});

  var DEFAULT_DELAY_FRAMES = 8; // ~0.13s at 60fps

  function ensureState() {
    if ($gameSystem && typeof $gameSystem._bbgAutoAdvanceEnabled === "undefined") {
      $gameSystem._bbgAutoAdvanceEnabled = false;
    }
  }

  function toggleAutoAdvance() {
    ensureState();
    $gameSystem._bbgAutoAdvanceEnabled = !$gameSystem._bbgAutoAdvanceEnabled;
  }

  function autoAdvanceEnabled() {
    ensureState();
    return !!$gameSystem._bbgAutoAdvanceEnabled;
  }

  function Window_BBG_AutoAdvance() {
    this.initialize.apply(this, arguments);
  }

  Window_BBG_AutoAdvance.prototype = Object.create(Window_Base.prototype);
  Window_BBG_AutoAdvance.prototype.constructor = Window_BBG_AutoAdvance;

  Window_BBG_AutoAdvance.prototype.initialize = function () {
    var width = 240;
    var height = this.fittingHeight(1);
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
    this.opacity = 200;
    this._lastState = null;
    this.refresh();
  };

  Window_BBG_AutoAdvance.prototype.update = function () {
    Window_Base.prototype.update.call(this);
    ensureState();

    var state = autoAdvanceEnabled();
    if (state !== this._lastState) {
      this.refresh();
    }

    if (!this.visible || !this.isOpen()) return;
    if (TouchInput.isTriggered() && this._hitTest(TouchInput.x, TouchInput.y)) {
      toggleAutoAdvance();
      this.refresh();
      TouchInput.clear();
    }
  };

  Window_BBG_AutoAdvance.prototype._hitTest = function (x, y) {
    return x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + this.height;
  };

  Window_BBG_AutoAdvance.prototype.refresh = function () {
    this.contents.clear();
    this._lastState = autoAdvanceEnabled();
    var label = "Auto Next: " + (this._lastState ? "ON" : "OFF");
    this.changeTextColor(this._lastState ? this.textColor(3) : this.textColor(7));
    this.drawText(label, 0, 0, this.contentsWidth(), "center");
    this.resetTextColor();
  };

  BBG.autoAdvance = {
    toggle: toggleAutoAdvance,
    enabled: autoAdvanceEnabled,
  };

  var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
  Scene_Map.prototype.createAllWindows = function () {
    _Scene_Map_createAllWindows.call(this);
    ensureState();
    this._bbgAutoAdvanceWindow = new Window_BBG_AutoAdvance();
    this.addWindow(this._bbgAutoAdvanceWindow);
  };

  Scene_Map.prototype._bbgPositionAutoAdvanceWindow = function () {
    if (!this._bbgAutoAdvanceWindow) return;

    // Prefer stacking under the Auto Click window if present.
    if (this._bbgAutoClickWindow) {
      this._bbgAutoAdvanceWindow.x = this._bbgAutoClickWindow.x;
      this._bbgAutoAdvanceWindow.y = this._bbgAutoClickWindow.y + this._bbgAutoClickWindow.height + 6;
      return;
    }

    // Prefer anchoring under the money HUD (MOG_VariableHud HUD #1 -> index 0).
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
        this._bbgAutoAdvanceWindow.x = hud.x + hudW - this._bbgAutoAdvanceWindow.width;
        this._bbgAutoAdvanceWindow.y = hud.y + hudH + 6;
        return;
      }
    }

    // Fallback: top-right.
    this._bbgAutoAdvanceWindow.x = Graphics.boxWidth - this._bbgAutoAdvanceWindow.width - 10;
    this._bbgAutoAdvanceWindow.y = 10;
  };

  var _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    ensureState();
    this._bbgPositionAutoAdvanceWindow();
  };

  var _Window_Message_isTriggered = Window_Message.prototype.isTriggered;
  Window_Message.prototype.isTriggered = function () {
    if (!this.pause) {
      this._bbgAutoAdvanceCounter = 0;
      return _Window_Message_isTriggered.call(this);
    }

    // While paused, never interfere with choice/number/item subwindows.
    if (this.isAnySubWindowActive && this.isAnySubWindowActive()) {
      this._bbgAutoAdvanceCounter = 0;
      return _Window_Message_isTriggered.call(this);
    }

    if (!autoAdvanceEnabled()) {
      this._bbgAutoAdvanceCounter = 0;
      return _Window_Message_isTriggered.call(this);
    }

    this._bbgAutoAdvanceCounter = (this._bbgAutoAdvanceCounter || 0) + 1;
    if (this._bbgAutoAdvanceCounter >= DEFAULT_DELAY_FRAMES) {
      this._bbgAutoAdvanceCounter = 0;
      return true;
    }

    // Block manual-trigger detection until our delay passes; user can still click
    // again after the next frame if they really want to force it.
    return false;
  };
})();
