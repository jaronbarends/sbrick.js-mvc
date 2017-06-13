;(function($) {

	'use strict';

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals someGlobalVar */ //Tell jshint someGlobalVar exists as global var
	const SBRICKNAME = 'SBrick';
	// const 


	/**
	* 
	* @returns {undefined}
	*/
	const logTemperature = function(value) {
		log('temperature:' + value + '%');
	};


	/**
	* 
	* @returns {undefined}
	*/
	var checkTemperatureHandler = function() {
		SBrick.getTemp()
			.then(logTemperature);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const logBatteryPercentage = function(value) {
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
	* 
	* @returns {undefined}
	*/
	const channel0Handler = function() {
		try {
			SBRICK.drive(SBrick.CHANNEL0, SBrick.CW, SBrick.MAX);
		} catch(e) {
			alert('catch in channel 0');
			alert(e);
		}
		alert('done 0');
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel1Handler = function() {
		SBRICK.drive(SBrick.CHANNEL1, SBrick.CW, SBrick.MAX);
		alert('done 1');
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel2Handler = function() {
		SBRICK.drive(SBrick.CHANNEL2, SBrick.CW, SBrick.MAX);
		alert('done 2');
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel3Handler = function() {
		SBRICK.drive(SBrick.CHANNEL3, SBrick.CW, SBrick.MAX);
		alert('done 3');
	};
	
	


	/**
	* initialize controls
	* @returns {undefined}
	*/
	const initControls = function() {
		document.getElementById('check-battery-btn').addEventListener('click', checkBatteryHandler);
		document.getElementById('check-temperature-btn').addEventListener('click', checkTemperatureHandler);
		document.getElementById('channel-0').addEventListener('click', channel0Handler);
		document.getElementById('channel-1').addEventListener('click', channel1Handler);
		document.getElementById('channel-2').addEventListener('click', channel2Handler);
		document.getElementById('channel-3').addEventListener('click', channel3Handler);
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
		document.getElementById('permission-btn').addEventListener('click', connectSBrick);
	};


	$(document).ready(init);

})(jQuery);
