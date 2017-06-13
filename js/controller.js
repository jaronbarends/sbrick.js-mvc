;(function($) {

	'use strict';

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals someGlobalVar */ //Tell jshint someGlobalVar exists as global var
	const SBRICKNAME = 'SBrick';


	/**
	* 
	* @returns {undefined}
	*/
	var logBatteryPercentage = function(value) {
		log('battery:' + value + '%');
	};


	/**
	* 
	* @returns {undefined}
	*/
	var checkBatteryHandler = function() {
		SBrick.getBattery()
			.then(logBatteryPercentage);
	};
	
	


	/**
	* initialize controls
	* @returns {undefined}
	*/
	const initControls = function() {
		document.getElementById('check-battery-btn').addEventListener('click', checkBatteryHandler);

		document.getElementById('controls').classList.remove('is-hidden');
	};
	


	/**
	* connect the SBrick
	* @returns {undefined}
	*/
	const connectSBrick = function() {
		SBrick.connect(SBRICKNAME)
		.then( () => {
			// SBrick now is connected
			log('connected');
			// alert('connected');
			initControls();
		} )
		.catch( (e) => {
			// alert('Caught error in SBrick.connect;\n'+e);
			log('Caught error in SBrick.connect;' + e);
		});
	};
	


	/**
	* handle user giving permission to use bluetooth
	* @returns {undefined}
	*/
	const permissionHandler = function() {
		connectSBrick();
	};


	/**
	* log to page
	* @returns {undefined}
	*/
	const log = function(msg) {
		document.getElementById('log').innerHTML += '<br>'+msg;
	};

	

	/**
	* initialize all
	* @param {string} varname Description
	* @returns {undefined}
	*/
	const init = function() {
		document.getElementById('permission-btn').addEventListener('click', () => {
			connectSBrick();
		});

		// SBrick.disconnect()
		// .then( ()=> {
		// 	// SBrick now is disconnected
		// 	console.log('SBrick is disconnected');
		// } )
		// .catch( (e) => {
		// 	console.log('Caught error in SBrick.disconnect:', e);
		// });
	};


	$(document).ready(init);

})(jQuery);
