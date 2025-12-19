(function() {
    var mousePress = false;
	var imageResources = getImageRes();
    var hasStarted = false;
    var audioGuard = null;

    my.ImageManager.load(imageResources, loadImageResources);

    /**
     * 加载图片资源
     */
    function loadImageResources(number) {
        my.DOM.get('progressText').innerHTML = 'Loading sprites...(' + ~~(number / imageResources.length * 100) + '%)';
        if(number < imageResources.length) {
            return false;
        }

        if(!buzz.isOGGSupported()) {
            startGame();
        } else {
            loadAudioResources(startGame);
        }
    }
	  /**
     * 加载音频资源
     */
    function loadAudioResources(done) {
        var res = getAudioRes(), len = res.length;
        var group = [], item, a;

        for(var i = 0; i < len; i++) {
            item = res[i];
            a = new buzz.sound(item.src, {
                formats : ['ogg'],
                preload : true,
                autoload : true,
                loop : !!item.loop
            });

            group.push(a);
            Audio.list[item.id] = a;   
        }

        var buzzGroup = new buzz.group(group);
        var number = 1;

        buzzGroup.bind('loadeddata', function(e) {
            my.DOM.get('progressText').innerHTML = 'Loading audio...(' + ~~(number / len * 100) + '%)';

            if(number >= len) {
                done();
            } else {
                number++;
            }
        });

        buzzGroup.bind('error', function() {
            done();
        });

        audioGuard = setTimeout(function() {
            done();
        }, 5000);
    }

    function startGame() {
        if (hasStarted) {
            return;
        }
        hasStarted = true;

        if (audioGuard) {
            clearTimeout(audioGuard);
            audioGuard = null;
        }

        var progress = my.DOM.get('progressText');
        if (progress) {
            my.DOM.remove(progress);
        }

        init();
    }

	
    /**
     * 初始化
     */
    function init() {
         Audio.play('game_music');

        // 创建游戏对象
        var mouseHit = new MouseHit();
        mouseHit.init();
        var ui = mouseHit.ui;

        // 点击开始按钮
        ui.onplay = function() {
            this.toBody();
            mouseHit.stateInit();
        }
        // 打开声音
        ui.onsoundopen = function() {
            Audio.mute = false;
            Audio.play('game_music', true);
        }
        // 关闭声音
        ui.onsoundclose = function() {
            Audio.mute = true;
            Audio.pauseAll();
        }
        // 暂停
        ui.onpause = function() {
            clearInterval(mouseHit.drawCanvasInterval);
			clearInterval(mouseHit.drawMouseInterval);
        }
        // 暂停重新开始
        ui.onreadystart = function() {
            mouseHit.__setIntervalFunc(mouseHit);
        }
        // 继续游戏
        ui.onresume = function() {
           mouseHit.__setIntervalFunc(mouseHit);
        }
    }

})();
