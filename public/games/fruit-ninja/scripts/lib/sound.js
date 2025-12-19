/**
 * 简易声效控制
 */

/**
 * 使用方法：
 * 
 * var sound = require( "sound/main" );
 * 
 * var snd = sound.create("sounds/myfile");
 * snd.play();
 */

var buzz = require( "buzz" );
var supported = buzz.isSupported();

var config = {
	formats: [ "ogg", "mp3" ],
	preload: true,
	autoload: true,
	loop: false
};

function ClassBuzz( src, options ){
    this.sound = new buzz.sound( src, mixConfig( options ) );
}

ClassBuzz.prototype.play = function( s ){
	s = this.sound;
	s.setPercent( 0 );
	s.setVolume( 100 );
	s.play();
};

ClassBuzz.prototype.stop = function(){
	this.sound.fadeOut( 1e3, function(){
	    this.pause();
	} );
};


exports.create = function( src, options ){
	if( !supported )
	    return unSupported;
	else
    	return new ClassBuzz( src, options );
}

function unSupported(){
	// TODO: 
}

unSupported.play =
unSupported.stop = function(){
	// TODO: 
};

function mixConfig( options ){
    var result = {};
    var overrides = options || {};
    var key;

    for( key in config )
        if( config.hasOwnProperty( key ) )
            result[ key ] = config[ key ];

    for( key in overrides )
        if( overrides.hasOwnProperty( key ) )
            result[ key ] = overrides[ key ];

    return result;
}
