//=============================================================================
// main.js
//=============================================================================

PluginManager.setup($plugins);

window.onload = function() {
    const startGame = function() {
        SceneManager.run(Scene_Boot);
    };

    if (typeof window.__BBG_START_BLOODMONEY__ === "function") {
        window.__BBG_START_BLOODMONEY__(startGame);
        return;
    }

    startGame();
};
