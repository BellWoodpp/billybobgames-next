
(function(){

window.onload = function()
{
	setTimeout(function()
	{
		game.load();
	}, 10);
};

var ns = Q.use("fish");

var game = ns.game = 
{	
	container: null,
	width: 480,
	height: 320,
	fps: 60,
	frames: 0,
	params: null,
	events: Q.supportTouch ? ["touchstart", "touchend", "touchmove"] : ["mousedown", "mouseup", "mousemove"],
	
	fireInterval: 30,
	fireCount: 0,
	sounds: null,
	audioUnlocked: false,
	_audioUnlockHandler: null
};

game.load = function(container)
{	
	//获取URL参数设置
	var params = this.params = Q.getUrlParams();
	if(params.mode == undefined) params.mode = 2;
	if(params.fps) this.fps = params.fps;
	this.fireInterval = this.fps*0.5;
	
	if(Q.isIpod || Q.isIphone)
	{
		this.width = 980;
		this.height = 545;
		Q.addMeta({name:"viewport", content:"user-scalable=no"});
	}else
	{		
		Q.addMeta({name:"viewport", content:"user-scalable=no, initial-scale=1.0, minimum-scale=1, maximum-scale=1"});
		this.width = Math.min(1024, window.innerWidth);
		this.height = Math.min(768, window.innerHeight);
	}

	if(params.width) this.width = Number(params.width) || this.width;
	if(params.height) this.height = Number(params.height) || this.height;
	
	//初始化容器设置
	this.container = container || Q.getDOM("container");
	this.container.style.overflow = "hidden";
	this.container.style.width = this.width + "px";
	this.container.style.height = this.height + "px";
	this.screenWidth = window.innerWidth;
	this.screenHeight = window.innerHeight;
	
	//load info
	var div = Q.createDOM("div", {innerHTML: "正在加载资源中，请稍候...<br>", style:
	{
		id: "loader",
		position: "absolute",
		width: this.width + "px",
		left: "0px",
		top: (this.height >> 1) + "px",
		textAlign: "center",
		color: "#fff",
		font: Q.isMobile ?  'bold 16px 黑体' : 'bold 16px 宋体',
		textShadow: "0 2px 2px #111"
	}});
	this.container.appendChild(div);
	this.loader = div;
    
    //hide nav bar
    this.hideNavBar();
    if(Q.supportOrientation)
    {
        window.onorientationchange = function(e)
        {
            game.hideNavBar();
           if(game.stage) game.stage.updatePosition();
        };
    }
	
	//start load image
	var imgLoader = new Q.ImageLoader();
	imgLoader.addEventListener("loaded", Q.delegate(this.onLoadLoaded, this));
	imgLoader.addEventListener("complete", Q.delegate(this.onLoadComplete, this));
	imgLoader.load(ns.R.sources);
};

game.onLoadLoaded = function(e)
{
	var content = "正在加载资源中，请稍候...<br>(" + Math.round(e.target.getLoadedSize()/e.target.getTotalSize()*100) + "%)";
	this.loader.innerHTML = content;
};

game.onLoadComplete = function(e)
{
	e.target.removeAllEventListeners();
	this.init(e.images);
};

game.init = function(images)
{
	ns.R.init(images);
	this.startup();
};

game.startup = function()
{
	var me = this;
	this.container.removeChild(this.loader);
	this.loader = null;
	
	//手持设备的特殊webkit设置	
	if(Q.isWebKit && !Q.supportTouch)
	{
		document.body.style.webkitTouchCallout = "none";
		document.body.style.webkitUserSelect = "none";
		document.body.style.webkitTextSizeAdjust = "none";
		document.body.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
	}   
	
	var context = null;
	if(this.params.mode == 1)
	{
		var canvas = Q.createDOM("canvas", {id:"canvas", width:this.width, height:this.height, style:{position:"absolute"}});
		this.container.appendChild(canvas);
		this.context = new Q.CanvasContext({canvas:canvas});
	}else
	{
		this.context = new Q.DOMContext({canvas:this.container});
	}
	
	this.stage = new Q.Stage({width:this.width, height:this.height, context:this.context, update:Q.delegate(this.update, this)});
		
	var em = this.evtManager = new Q.EventManager();
	em.registerStage(this.stage, this.events, true, true);	
	
	this.initUI();
	this.initPlayer();
	this.setupAudio();
	
	//this.testFish();
	//this.testFishDirection();
	//this.testFishALL();
	
	this.fishManager = new ns.FishManager(this.fishContainer);
	this.fishManager.makeFish();
	
	var timer = this.timer = new Q.Timer(1000 / this.fps);
	timer.addListener(this.stage);
	timer.addListener(Q.Tween);
	timer.start();
	
	this.showFPS();
};

game.initUI = function()
{
	this.bg = new Q.Bitmap({id:"bg", image:ns.R.mainbg, transformEnabled:false});
	
	this.fishContainer = new Q.DisplayObjectContainer({id:"fishContainer", width:this.width, height:this.height, eventChildren:false, transformEnabled:false});
	this.fishContainer.onEvent = function(e)
	{
		if(!game.player) return;
		
		var pointer = {x:e.eventX, y:e.eventY};
		if(game.events[2] && e.type == game.events[2])
		{
			game.player.aim(pointer);
		}
		
		if(e.type == game.events[0] && game.fireCount >= game.fireInterval)
		{
			game.fireCount = 0;
			game.player.fire(pointer);
		}
	};
		
	this.bottom = new Q.Bitmap(ns.R.bottombar);
	this.bottom.id = "bottom";
	this.bottom.x = this.width - this.bottom.width >> 1;
	this.bottom.y = this.height - this.bottom.height + 2;
	this.bottom.transformEnabled = false;
	
	this.stage.addChild(this.bg, this.fishContainer, this.bottom);	
};

game.initPlayer = function()
{
	var coin = Number(this.params.coin) || 10000;
	this.player = new ns.Player({id:"quark", coin:coin});
};

game.setupAudio = function()
{
	if(typeof Audio === "undefined") return;
	var manifest = {
		catch: "https://r2bucket.billybobgames.org/9-html5demo7/sound/get%20gold%20coins.mp3",
		bank: "https://r2bucket.billybobgames.org/9-html5demo7/sound/inverted%20gold%20coins.wav",
		bgm: "https://r2bucket.billybobgames.org/9-html5demo7/sound/BGM.mp3"
	};

	this.sounds = {};

	for(var key in manifest)
	{
		if(!manifest.hasOwnProperty(key)) continue;
		var audio = null;
		try
		{
			audio = new Audio();
			audio.crossOrigin = "anonymous";
			audio.src = manifest[key];
			audio.preload = "auto";
			if(audio.load) audio.load();
			if(key === "bgm") audio.loop = true;
			audio.addEventListener("error", function(ev){
				if(window && window.console)
				{
					console.warn("Audio load error:", ev && ev.target ? ev.target.src : ev);
				}
			});
		}
		catch(err)
		{
			audio = null;
		}
		this.sounds[key] = audio;
	}

	this.audioUnlocked = true;
	this.playBGM(true);
};

game.addAudioUnlockListeners = function()
{
	if(typeof Audio === "undefined" || !this._audioUnlockHandler) return;
	var events = ["pointerdown", "mousedown", "touchstart"];
	var target = this.container || window;
	for(var i = 0; i < events.length; i++)
	{
		target.addEventListener(events[i], this._audioUnlockHandler, false);
	}
	if(target !== window)
	{
		for(var j = 0; j < events.length; j++)
		{
			window.addEventListener(events[j], this._audioUnlockHandler, false);
		}
	}
};

game.removeAudioUnlockListeners = function()
{
	if(!this._audioUnlockHandler) return;
	var events = ["pointerdown", "mousedown", "touchstart"];
	var target = this.container || window;
	for(var i = 0; i < events.length; i++)
	{
		target.removeEventListener(events[i], this._audioUnlockHandler, false);
	}
	if(target !== window)
	{
		for(var j = 0; j < events.length; j++)
		{
			window.removeEventListener(events[j], this._audioUnlockHandler, false);
		}
	}
};

game.playSound = function(key)
{
	if(!this.sounds) return;
	var audio = this.sounds[key];
	if(!audio) return;
	try
	{
		var node = audio.cloneNode();
		node.crossOrigin = audio.crossOrigin || "anonymous";
		var playPromise = node.play();
		if(playPromise && playPromise.catch)
		{
			playPromise.catch(function(){});
		}
	}
	catch(err)
	{
	}
};

game.playBGM = function(force)
{
	if(!this.sounds) return;
	var audio = this.sounds.bgm;
	if(!audio) return;
	try
	{
		if(audio.paused) audio.currentTime = 0;
		var playPromise = audio.play();
		if(playPromise && playPromise.then)
		{
			var self = this;
			playPromise.then(function(){ self.audioUnlocked = true; }).catch(function(){});
		}
	}
	catch(err)
	{
	}
};

game.stopBGM = function()
{
	if(!this.sounds) return;
	var audio = this.sounds.bgm;
	if(!audio) return;
	try
	{
		audio.pause();
	}
	catch(err)
	{
	}
};

game.update = function(timeInfo)
{
	this.frames++;
	this.fireCount++;
	this.fishManager.update();
};

game.testFish = function()
{
	var num = this.params.num || 50, len = ns.R.fishTypes.length;
	for(var i = 0; i < num; i++)
	{
		var chance = Math.random() * (len - 1) >> 0;
		var index = Math.random() * chance + 1 >> 0;
		var type = ns.R.fishTypes[index];
		
		var fish = new ns.Fish(type);
		fish.x = Math.random()*this.width >> 0;
		fish.y = Math.random()*this.height >> 0;
		fish.moving = true;
		fish.rotation = Math.random() * 360 >> 0;
		fish.init();
		this.fishContainer.addChild(fish);
	}
};

game.testFishDirection = function()
{
	var dirs = [0, 45, 90, 135, 180, 225, 270, 315];
	
	for(var i = 0; i < 8; i++)
	{
		var fish = new ns.Fish(ns.R.fishTypes[1]);
		fish.x = this.width >> 1;
		fish.y = this.height >> 1;
		fish.speed = 0.5;
		fish.setDirection(dirs[i]);
		fish.moving = true;
		this.stage.addChild(fish);
	}
};

game.testFishALL = function()
{
	var sx = 100, sy = 50, y = 0, len = ns.R.fishTypes.length;
	for(var i = 0; i < len - 1; i++)
	{
		var type = ns.R.fishTypes[i+1];
		var fish = new ns.Fish(type);	
		if(i == 9) fish.x = sx;
		else fish.x = sx + Math.floor(i/5)*200;
		if(i == 9) y = sy + 320;
		else if(i%5 == 0) y = sy;
		fish.y = y + (i%5) * 20;
		y += fish.height;
		fish.update = function(){ };
		this.stage.addChild(fish);
	}
};

game.showFPS = function()
{
	var me = this, fpsContainer = Quark.getDOM("fps");
	if(fpsContainer)
	{
		setInterval(function()
		{
			fpsContainer.innerHTML = "FPS:" + me.frames;
			me.frames = 0;
		}, 1000);
	}
};

game.hideNavBar = function()
{
    window.scrollTo(0, 1);
};

})();
