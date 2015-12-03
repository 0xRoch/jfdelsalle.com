/**
 * Galleria (http://monc.se/kitchen)
 *
 * Galleria is a javascript image gallery written in jQuery. 
 * It loads the images one by one from an unordered list and displays thumbnails when each image is loaded. 
 * It will create thumbnails for you if you choose so, scaled or unscaled, 
 * centered and cropped inside a fixed thumbnail box defined by CSS.
 * 
 * The core of Galleria lies in it's smart preloading behaviour, snappiness and the fresh absence 
 * of obtrusive design elements. Use it as a foundation for your custom styled image gallery.
 *
 * MAJOR CHANGES v.FROM 0.9
 * Galleria now features a useful history extension, enabling back button and bookmarking for each image.
 * The main image is no longer stored inside each list item, instead it is placed inside a container
 * onImage and onThumb functions lets you customize the behaviours of the images on the site
 *
 * Tested in Safari 3, Firefox 2, MSIE 6, MSIE 7, Opera 9
 * 
 * Version 1.0
 * Februari 21, 2008
 *
 * Copyright (c) 2008 David Hellsing (http://monc.se)
 * Licensed under the GPL licenses.
 * http://www.gnu.org/licenses/gpl.txt
 **/
/*------------------------------------------------------------------------------------*/
/*  Galleria(WP)                                                                      */
/*                                                                                    */
/*   CAUTION!!!    This is not a original version of Galleria V1.0.                   */
/*                                                                                    */
/*   Major modification : replaced all '$' global to 'jQuery'                         */
/*                        (to keep avoid global name conflicts)                       */
/*                                                                                    */
/*                        added the second caption line                               */
/*                                                                                    */
/*                                                     modified by Y2 May 11, 2008    */
/*                                                                                    */
/*  V1.2.2 Build 705  6/21 2008                                                       */
/*------------------------------------------------------------------------------------*/
var gCounter = 0;
var tempClass = "";
var shrink = new Array();
var index_position = new Array();
var doShowImage = new Array();
var usejcarousel = new Array();
var hideThumbnail = new Array();
var isVertical = new Array();
var thumbnailColumns = new Array();
var thumbnail_caption_text = new Array();
var numOfListItems = new Array();
var caption1CSSStyles = new Array();
var caption2CSSStyles = new Array();
var gInitMsg = new Array();
var gPrepared = new Array();

(function($) {

var galleria;

/**
 * 
 * @desc Convert images from a simple html <ul> into a thumbnail gallery
 * @author David Hellsing
 * @version 1.0
 *
 * @name Galleria
 * @type jQuery
 *
 * @cat plugins/Media
 * 
 * @example jQuery('ul.gallery').galleria({options});
 * @desc Create a a gallery from an unordered list of images with thumbnails
 * @options
 *	 insert:   (selector string) by default, Galleria will create a container div before your ul that holds the image.
 *			   You can, however, specify a selector where the image will be placed instead (f.ex '#main_img')
 *	 history:  Boolean for setting the history object in action with enabled back button, bookmarking etc.
 *	 onImage:  (function) a function that gets fired when the image is displayed and brings the jQuery image object.
 *			   You can use it to add click functionality and effects.
 *			   f.ex onImage(image) { image.css('display','none').fadeIn(); } will fadeIn each image that is displayed
 *	 onThumb:  (function) a function that gets fired when the thumbnail is displayed and brings the jQuery thumb object.
 *			   Works the same as onImage except it targets the thumbnail after it's loaded.
 *
**/

/**************************************************************************************/
galleria = 
jQuery.fn.galleria = function( $options ) {

	// temporary class
	if ( $options.tempClass) { 
		tempClass = $options.tempClass;
	}
	gPrepared[tempClass] = false;

	// shrink mode
	if ( $options.shrink ) { 
		shrink[tempClass] = $options.shrink;
	}
	
	// index position
	if ( $options.index ) { 
		index_position[tempClass] = $options.index;
	}
	
	// jcarousel scroll
	if ( $options.jcarousel ) { 
		usejcarousel[tempClass] = $options.jcarousel == 1 ?  true: false;
	}

	// thumbnail columns  [ 6/21 2008 ]
	if ( $options.thumbnailColumns ) {
		thumbnailColumns[tempClass]= parseInt($options.thumbnailColumns);
	}
	
	// thumbnail  on/off  [ 6/05 2008 ]
	if ( $options.hideThumbnail ) {
		hideThumbnail[tempClass]= ($options.hideThumbnail == 1 ) ? true : false;
	}
	if ( hideThumbnail[tempClass] ) gInitMsg[tempClass] = true;

	// main image  on/off  [ 6/05 2008 ]
	if ( $options.doShowImage ) {
		doShowImage[tempClass] = ($options.doShowImage == 1 ) ? true : false;
	}
	if ( $options.isVertical ) {
		isVertical[tempClass] = ($options.isVertical == 1 ) ? true : false;
	}
	if ( $options.caption1_css ) {
		caption1CSSStyles[tempClass] =  $options.caption1_css;
	}
	if ( $options.caption2_css ) {
		caption2CSSStyles[tempClass] =  $options.caption2_css;
	}
	
	
	// check for basic CSS support 
	//if (!galleria.hasCSS()) { return false; }	 // Opera returns false. why?

	// init the modified history object
	//jQuery.historyInit( galleria.onPageLoad ); // 

	// set default options
	var $defaults = {
		insert		: '.galleria_inserted_stage',
		history		: true,
		clickNext	: true,
		//onImage	  : function( image, caption, thumb ) {},
		onImage		: function( image, caption1, caption2, thumb ) {}, // modified by Y2
		onThumb		: function( thumb ) {}
	};

	// extend the options
	var $opts = jQuery.extend( $defaults, $options );


	// bring the options to the galleria object
	for (var i in $opts) {
		jQuery.galleria[i] = $opts[i];
	}

	// if no insert selector, create a new division and insert it before the ul
	var _inserted_stage = ( jQuery($opts.insert).is($opts.insert) ) ? 
		jQuery($opts.insert) : 
		jQuery(document.createElement('div')).insertBefore(this);

	thumbnail_caption_text[tempClass] = $opts.thumbnail_caption;

	// get original ul width 6/21 2008
	var ul_width = jQuery(this).width();

	if ( !hideThumbnail[tempClass] ) {
		// thumbnail caption 
		var _thumbspan = jQuery('div.' + tempClass + '  span.msg' );
			_thumbspan.text(thumbnail_caption_text[tempClass]).addClass(tempClass);
	}

	// create a wrapping div for the image
	var _div = jQuery(document.createElement('div')).addClass( 'galleria_wrapper' );

	// create a caption span
	var _span0 = jQuery(document.createElement('span')).addClass('caption0');
	var _span1 = jQuery(document.createElement('span')).addClass('caption1');
	var _span2 = jQuery(document.createElement('span')).addClass('caption2');

	// inject the wrapper in the insert selector
	//_inserted_stage.addClass('galleria_container').append(_div).append(_span)

	if ( index_position[tempClass] == 'top' ) {
		_inserted_stage.addClass('galleria_container').append(_span0).append(_div).append(_span1).append(_span2);
	} else {
		_inserted_stage.addClass('galleria_container').append(_div).append(_span0).append(_span1).append(_span2);
	}

	//-------------
	var  total_li_width = 0;
	var  li_width  = 0;

	//return this.each( function() {

	this.each( function() {

		// add the Galleria class
		jQuery(this).addClass('galleria');

		numOfListItems[tempClass] = 0;

		// loop through list
		jQuery(this).children('li').each( function( i ) {
		
			// add the Galleria class
			jQuery(this).addClass('galleria');

			(numOfListItems[tempClass])++;
			
			// bring the scope
			var _container = jQuery(this);

			// 6/21 2008
			var border_width = parseInt( _container.css('borderLeftWidth') ) 
							 + parseInt( _container.css('borderRightWidth') );
			border_width =  isNaN(border_width) ? 0 : border_width;

			li_width = _container.width() + border_width ;
			total_li_width += li_width;

			// build element specific options
			var _o = jQuery.meta ? jQuery.extend({}, $opts, _container.data()) : $opts;

			// remove the clickNext if image is only child
			_o.clickNext = jQuery(this).is(':only-child') ? false : _o.clickNext;

			var _img = null;

			// try to fetch an anchor
			var _a = jQuery(this).find('a').is('a') ? jQuery(this).find('a') : false;
			
			if ( _a.find('img') ) {
				// has thumbnail image
				_img = _a.children('img').css('display','none');
			} else {
				// original image
				_img = jQuery(this).children('img').css('display','none');
			}
			// add the Galleria class
			_img.addClass('galleria');


			// reference the original image as a variable and hide it
			//var _img = jQuery(this).children('img').css('display','none');

			// extract the original source
			var _src = _a ? _a.attr('href') : _img.attr('src');

			// find a title
			//var _title = _a ? _a.attr('title') : _img.attr('title');
			var _title = _a ? jQuery.trim(_a.attr('title')) : jQuery.trim(_img.attr('title'));


			// create loader image
			var _loader = new Image();

			// check url and activate container if match
			//if (_o.history && (window.location.hash && window.location.hash.replace(/\#/,'') == _src)) {
			//	_container.siblings('.active').removeClass('active');
			//	_container.addClass('active');
			//}

			// begin loader
			jQuery(_loader).load( function () {

				// try to bring the alt
				jQuery(this).attr('alt',_img.attr('alt')).addClass('galleria');

				//-----------------------------------------------------------------
				// the image is loaded, let's create the thumbnail

				//** modified by Y2	 (force to scale thumbnail images) **//
				//var _thumb = _a ? 
					//_a.find('img').addClass('thumb noscale').css('display','none') :
				//	_a.find('img').addClass('thumb').css('display','none') : 
				//	_img.clone(true).addClass('thumb').css('display','none');
				
				var _thumb = _img.clone(true).addClass('galleria thumb').css('display','none');
				
				if ( $options.cropThumbnail == 1 ) { 
					_thumb.addClass('noscale');
				}

				// drop original anchor tag
				if (_a) { _a.replaceWith(_thumb); }

				if (!_thumb.hasClass('noscale')) { // scaled tumbnails!
				
					//var w = Math.ceil( _img.attr('width') / _img.attr('height') * _container.height() );
					//var h = Math.ceil( _img.attr('height') / _img.attr('width') * _container.width() );

					// modified by Y2
					var w = Math.ceil( _thumb.width() / _thumb.height() * _container.height() );
					var h = Math.ceil( _thumb.height() / _thumb.width() * _container.width() );

					// a tiny timer fixed the width/height
					window.setTimeout( function() {

						w = Math.ceil( _thumb.width() / _thumb.height() * _container.height() );
						h = Math.ceil( _thumb.height() / _thumb.width() * _container.width() );

						if ( w < h ) {
							_thumb.css({ height: 'auto', width: _container.width()+'px', marginTop: -( h - _container.height())/2 +'px' });
						} else {
							_thumb.css({ width: 'auto', height: _container.height()+'px', marginLeft: -(w - _container.width())/2 + 'px'});
						}
					}, 100 ); // ( 100ms )

				} else { // Center thumbnails.

					// a tiny timer fixed the width/height
					window.setTimeout( function() {
						_thumb.css({
							marginLeft: -( _thumb.width()  - _container.width() )/2, 
							marginTop:	-( _thumb.height() - _container.height() )/2
						});
					}, 5 ); // incresed ticks ( 1ms => 5ms )
				}

				// add the rel attribute
				_thumb.attr('rel',_src);

				// add the title attribute
				_thumb.attr('title',_title);

				// add the click functionality to the _thumb
				_thumb.click( function() {
					//jQuery.galleria.activate( _src );
					// added 2nd argument : (stage ID)	 V1.1  5/11 2008
					//       3rd argument : V1.2 5/30 2008
					jQuery.galleria.activate( _src, _inserted_stage.attr('id'), $options.tempClass );
				});

				// hover classes for IE6
				_thumb.hover(
					function() { jQuery(this).addClass('hover'); },
					function() { jQuery(this).removeClass('hover'); }
				);
				_container.hover(
					function() { _container.addClass('hover'); },
					function() { _container.removeClass('hover'); }
				);

				// prepend the thumbnail in the container
				_container.prepend( _thumb );

				// show the thumbnail
				_thumb.css( 'display','block' );

				// call the onThumb function
				_o.onThumb( jQuery(_thumb) );

				// check active class and activate image if match
				if ( _container.hasClass('active') ) {
					//jQuery.galleria.activate( _src );
					// added 2nd argument : (stage ID)	 V1.1  5/11 2008
					jQuery.galleria.activate( _src, _inserted_stage.attr('id'), $options.tempClass );
					//_span.text(_title);
				}

				//-----------------------------------------------------------------

				// finally delete the original image
				_img.remove();

			}).error(function () {
				// Error handling
				//_container.html('<span class="error" style="color:red">Error loading image: '+_src+'</span>');

			}).attr('src', _src);

		}); // end of [ jQuery(this).children('li').each( function( i ) {} ]
		gPrepared[tempClass] = true;
	}); // end of [ this.each( function(){} ]

	// adjust ul  width  6/21 2008 
	if ( !usejcarousel[tempClass] ) {
	
		var max_num_of_items = Math.floor(ul_width / li_width);
		var new_ul_width = max_num_of_items * li_width;
		if ( thumbnailColumns[tempClass] > 0 ) {
			new_ul_width = thumbnailColumns[tempClass] * li_width;
		}
		new_ul_width = Math.min( new_ul_width, total_li_width);
		
		if ( new_ul_width > ul_width ) {
			new_ul_width = max_num_of_items * li_width;
		}
		
		var new_width_css = new_ul_width + "px";
		jQuery(this).css( 'width', new_width_css );
	}

	return;
};

/**************************************************************************************/

/**
 *
 * @name NextSelector
 *
 * @desc Returns the sibling sibling, or the first one
 *
**/

galleria.nextSelector = function(selector) {
	return jQuery(selector).is(':last-child') ?
		   jQuery(selector).siblings(':first-child') :
		   jQuery(selector).next();
		   
};

/**
 *
 * @name previousSelector
 *
 * @desc Returns the previous sibling, or the last one
 *
**/

galleria.previousSelector = function(selector) {
	return jQuery(selector).is(':first-child') ?
		   jQuery(selector).siblings(':last-child') :
		   jQuery(selector).prev();
		   
};

/**
 *
 * @name hasCSS
 *
 * @desc Checks for CSS support and returns a boolean value
 *
**/

galleria.hasCSS = function()  {
	jQuery('body').append(
		jQuery(document.createElement('div')).attr('id','css_test')
		.css({ width:'1px', height:'1px', display:'none' })
	);
	var _v = (jQuery('#css_test').width() != 1) ? false : true;
	jQuery('#css_test').remove();
	return _v;
};

/**
 *
 * @name onPageLoad
 *
 * @desc The function that displays the image and alters the active classes
 *
 * Note: This function gets called when:
 * 1. after calling jQuery.historyInit();
 * 2. after calling jQuery.historyLoad();
 * 3. after pushing "Go Back" button of a browser
 *
**/

//galleria.onPageLoad = function( _src ) {
galleria.onPageLoad = function( _src, _target_id, _temp_class ) {

	// dummy  6/07 2008
	//var _outer_wrapper = jQuery('div.' + _temp_class ); 

	// get the wrapper
	//var _wrapper = jQuery( '.galleria_wrapper' );
	var _wrapper = jQuery('#' + _target_id + ' div.galleria_wrapper' ); 
	
	// get the thumb
	//var _thumb = jQuery('.galleria img[@rel="'+_src+'"]');
	var _thumb = jQuery('ul.' + _temp_class + '  img[@rel="'+_src+'"]');


	if ( _src ) {

		// alter the active classes
		_thumb.parents('li').siblings('.active').removeClass('active');
		_thumb.parents('li').addClass('active');

		var	 image_width  = 0;
		var	 image_height = 0;
			
		if ( doShowImage[_temp_class] ) {
			// define a new image
			var _img   = jQuery( new Image() ).attr('src',_src).addClass('galleria replaced ' + _temp_class );

			// copy thumbnail's alt attribute to main image
			_img.attr('alt', _thumb.attr('title') );
			
			image_width  = _img.attr('width');
			image_height = _img.attr('height');
		}
				
		var	 wrapper_width  = _wrapper.width();
		var	 wrapper_height = _wrapper.height();// no contents -> returns 0 
		if ( wrapper_width  == undefined || wrapper_width  == null || 
			 wrapper_height == undefined || wrapper_height == null) {
			var _tmp_wrapper = jQuery( 'div.' + _temp_class  );
			wrapper_width  = _tmp_wrapper.width();
			wrapper_height = _tmp_wrapper.height(); // dummy (not use)
		}

		// captions
		var captionText = "";
		if ( _thumb.attr('title') ) {
			captionText = _thumb.attr('title').split("::");
		}
		if ( captionText[2] != null ) {
			captionText[1] += captionText[2]; // 5/13 2008 
		}

		// search "active" class item
		var image_index_text = "";
		if ( doShowImage[_temp_class] ) {
			_thumb.parents('li').parents('ul').children('li').each( function( i ) {
				if ( jQuery(this).hasClass('active') ) {
					if ( gPrepared[_temp_class] ) {
						image_index_text = "# " + (i+1) + " / " + numOfListItems[_temp_class];
					} else {
						image_index_text ="# " + (i+1);
					}
				}
			});
		}

		// empty the wrapper and insert the new image
		_wrapper.empty();
		_wrapper.css('overflow', 'hidden');
		
		switch ( index_position[_temp_class] ) {

			case 'top' :
				_wrapper.siblings('.caption0').text(image_index_text);
				if ( doShowImage[_temp_class] ) _wrapper.append( _img );
				if ( captionText[0] ) _wrapper.siblings('.caption1').text(captionText[0]);
				if ( captionText[1] ) _wrapper.siblings('.caption2').text(captionText[1]);
				break;

			case 'bottom' :
				if ( doShowImage[_temp_class] ) _wrapper.append( _img );
				_wrapper.siblings('.caption0').text( image_index_text);
				if ( captionText[0] ) _wrapper.siblings('.caption1').text(captionText[0]);
				if ( captionText[1] ) _wrapper.siblings('.caption2').text(captionText[1]);
				break

			case 'caption1' :
				if ( doShowImage[_temp_class] ) _wrapper.append( _img );
				if ( captionText[0] != null ) {
					_wrapper.siblings('.caption1').text( captionText[0] + "   [ " + image_index_text + " ]" );
				} else {
					_wrapper.siblings('.caption1').text( image_index_text );
				}
				if ( captionText[1] ) _wrapper.siblings('.caption2').text(captionText[1]);
				break

			case 'caption2' :
				if ( doShowImage[_temp_class] ) _wrapper.append( _img );
				if ( captionText[0] ) _wrapper.siblings('.caption1').text(captionText[0]);
				if ( captionText[1] != null ) {
					_wrapper.siblings('.caption2').text( captionText[1] + "   [ " + image_index_text + " ]" );
				} else {
					_wrapper.siblings('.caption2').text( image_index_text );
				}
				break

			default :
				if ( doShowImage[_temp_class] ) _wrapper.append( _img );
				if ( captionText[0] ) _wrapper.siblings('.caption1').text(captionText[0]);
				if ( captionText[1] ) _wrapper.siblings('.caption2').text(captionText[1]);
				break;

		} // end of [ switch( index_position ) ]
		
		// clear caption text  6/13 2008  build 703
		if ( !captionText[0] ) _wrapper.siblings('.caption1').text('');
		if ( !captionText[1] ) _wrapper.siblings('.caption2').text('');
		
		
		if ( caption1CSSStyles[_temp_class] ) {
			var css_token = caption1CSSStyles[_temp_class].split( ';' );
			for ( var i = 0; i < css_token.length; i++ ) {
				var token = css_token[i].split(':');
				if ( token[0] && token[1] ) {
					var attr = token[0].replace( " ",""); 
					var property = token[1].replace( " ","");
					_wrapper.siblings('.caption1').css( attr, property );
				}
			}
		} 
		if ( caption2CSSStyles[_temp_class] ) {
			var css_token = caption2CSSStyles[_temp_class].split( ';' );
			for ( var i = 0; i < css_token.length; i++ ) {
				var token = css_token[i].split(':');
				if ( token[0] && token[1] ) {
					var attr = token[0].replace( " ",""); 
					var property = token[1].replace( " ","");
					_wrapper.siblings('.caption2').css( attr, property );
				}
			}
		} 
		
		//wrapper_width  = _wrapper.width() : // <===  (will be an error on IE)
		//wrapper_height = _wrapper.height(); // <===  
		
		
		// insert the caption
		//_wrapper.siblings('.caption').text(_thumb.attr('title'));

		// fire the onImage function to customize the loaded image's features
		//jQuery.galleria.onImage(_img,_wrapper.siblings('.caption'),_thumb);
		
		if ( !hideThumbnail[_temp_class] && !isVertical[_temp_class] && !gInitMsg[_temp_class] ) {
			// get the thumbnail caption
			var _thumb_caption_msg = jQuery('div.' + _temp_class + ' span.msg');
			var _thumb_caption_wrapper = jQuery('div.galleria_thumb_caption.' + _temp_class );
			
			// fade out the thumbnail caption and goes to behind (overlayed : 6/03 2008)
			_thumb_caption_msg.css( 'display' , 'block' );
			_thumb_caption_msg.css( 'z-index' , '999' );
			_thumb_caption_msg.css( 'color' , 'white' );
			_thumb_caption_msg.css( 'background-color' , 'black' );

			//_thumb_caption_msg.show( 1000 ); 
			_thumb_caption_msg.fadeTo(5000,0.5, function() { 
			
				jQuery(this).fadeOut( 2000 );
				//jQuery(this).hide();
				if ( jQuery.browser.opera || jQuery.browser.mozilla ) {
			//		_thumb_caption_wrapper.css( 'marginTop', original_margin_top );
				}
				jQuery(this).text("");
				jQuery(this).css( 'z-index' , '-5' );
				jQuery(this).css( 'display' , 'none' );

			} );
			gInitMsg[_temp_class] = true; // do not show msg again 

		} // end of [ if ( !hideThumbnail && !isVertical ){} ]


		if ( doShowImage[_temp_class] ) {
			// fire the onImage function to customize the loaded image's features
			jQuery.galleria.onImage( _img,
									 _wrapper.siblings('.caption1'),
									 _wrapper.siblings('.caption2'),
									 _thumb );

			// add clickable image helper
			if(jQuery.galleria.clickNext) {
				//_img.css('cursor','pointer').click( function() { jQuery.galleria.next(); })
				_img.css('cursor','pointer').click( function() {
					jQuery.galleria.next( _target_id, _temp_class );
				});
			}
			
		} else {
			jQuery.galleria.onImage( null,
									 _wrapper.siblings('.caption1'),
									 _wrapper.siblings('.caption2'),
									 _thumb );
		}
	} else { // else of [ if ( _src ) ]

		// clean up the container if none are active
		_wrapper.siblings().andSelf().empty();

		// remove active classes
		//jQuery('.galleria li.active').removeClass('active');
		jQuery('ul.' + _temp_class + ' li.active').removeClass('active');

	}  // end of [ if ( _src ) ]

	// place the source in the galleria.current variable
	//jQuery.galleria.current = _src;
	jQuery.galleria.current[_target_id] = _src;

}

/**
 *
 * @name jQuery.galleria
 *
 * @desc The global galleria object holds four constant variables and four public methods:
 *		 jQuery.galleria.history = a boolean for setting the history object in action with named URLs
 *		 jQuery.galleria.current = is the current source that's being viewed.
 *		 jQuery.galleria.clickNext = boolean helper for adding a clickable image that leads to the next one in line
 *		 jQuery.galleria.next() = displays the next image in line, returns to first image after the last.
 *		 jQuery.galleria.prev() = displays the previous image in line, returns to last image after the first.
 *		 jQuery.galleria.activate(_src) = displays an image from _src in the galleria container.
 *		 jQuery.galleria.onImage(image,caption) = gets fired when the image is displayed.
 *
**/

jQuery.extend( { 

	galleria : {

		//current : '',
		current : new Array(),

		onImage : function(){
		},
		
		onThumb : function(){
		},

		//activate : function( _src ) {
		activate : function( _src, _target_id, _tmp_class ) {

			galleria.onPageLoad( _src, _target_id, _tmp_class );

			//=========================================================//
			//			for jCarousel thumbnail scroll
			//=========================================================//
			if ( usejcarousel ) {
				jcarousel_scroll_to_active_item( _tmp_class );
			}
			//=========================================================//
		},

		//next : function() {
		next : function( _target_id, _tmp_class ) {
		
			//var _next_src = jQuery(galleria.nextSelector(jQuery('.galleria' img[@rel="'+jQuery.galleria.current+'"]').parents('li'))).find('img').attr('rel');

			var _next_src = 
		jQuery( galleria.nextSelector( jQuery( 'ul.' + _tmp_class + ' li img[@rel="'+jQuery.galleria.current[_target_id]+'"]').parents('li'))).find('img').attr('rel');

			//jQuery.galleria.activate( _next_src );
			jQuery.galleria.activate( _next_src, _target_id, _tmp_class );
		},

		//prev : function() {
		prev : function( _target_id, _tmp_class ) {

			//var _prev_src = jQuery(galleria.previousSelector(jQuery('.galleria	img[@rel="'+jQuery.galleria.current+'"]').parents('li'))).find('img').attr('rel');

			var _prev_src = jQuery( galleria.previousSelector( jQuery( 'ul.' + _tmp_class + ' img[@rel="'+jQuery.galleria.current[_target_id]+'"]').parents('li'))).find('img').attr('rel');

			//jQuery.galleria.activate( _prev_src );
			jQuery.galleria.activate( _prev_src, _target_id, _tmp_class );
		}
	}

});

})(jQuery);
