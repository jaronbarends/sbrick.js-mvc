(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	let body = document.body,
		mySBrick;


	/**
	* 
	* @returns {undefined}
	*/
	const startDrive = function() {
		let data = {
			portId: 1,
			power: 255,
			direction: 0
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const stopDrive = function() {
		let data = {
			portId: 1,
			power: 0,
			direction: 0
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const lightsOn = function() {
		let data = {
			portId: 0,
			power: 255
		};
		mySBrick.drive(data);
	};


	/**
	* 
	* @returns {undefined}
	*/
	const lightsOff = function() {
		let data = {
			portId: 0,
			power: 0
		};
		mySBrick.drive(data);
	};
	
	
	


	/**
	* handle a voice command
	* @returns {undefined}
	*/
	const voicecommandHandler = function(e) {
		let command = e.detail.command;


		
		if (command === 'start motor') {
			startDrive();
		} else if (command === 'stop motor') {
			stopDrive();
		} else if (command === 'lights on') {
			lightsOn();
		} else if (command === 'lights off') {
			lightsOff();
		} 
	};
	


	/**
	* add listeners for sbrick events
	* @returns {undefined}
	*/
	const addVoiceCommandListeners = function() {
		body.addEventListener('voicecommand', voicecommandHandler);
	};



	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		window.mySBrick = window.mySBrick || new SBrick();
		mySBrick = window.mySBrick;
		addVoiceCommandListeners();
	};
console.log('do');



	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
