(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	let body = document.body,
		mySBrick;
	


	/**
	* send a command to the sbrick
	* @returns {undefined}
	*/
	const sendCommand = function(eventName, command, data) {
		// make sure we always have values to send
		// define default data to send to drive commands
		let defaultDriveData = {
			portId: 0,
			direction: mySBrick.CW,
			power: 0
		};

		let dataToSend = Object.assign({}, defaultDriveData, data);

		if (command === 'quickDrive') {
			dataToSend = [dataToSend];
		}

		// send drive instructions
		mySBrick[command](dataToSend)
			.then( (returnedData) => {
				// all went well, sent an event with the new port values
				const event = new CustomEvent(eventName, {detail: returnedData});
				body.dispatchEvent(event);
			});
	};
	


	/**
	* pass request to change lights to sbrick.js
	* @returns {undefined}
	*/
	const setlightsHandler = function(e) {
		sendCommand('lightschange.sbrick', 'drive', e.detail);
	};
	


	/**
	* pass request to change drive to sbrick.js
	* @returns {undefined}
	*/
	const setdriveHandler = function(e) {
		sendCommand('drivechange.sbrick', 'quickDrive', e.detail);
	};
	


	/**
	* pass request to change servo to sbrick.js
	* @returns {undefined}
	*/
	const setservoHandler = function(e) {
		sendCommand('servochange.sbrick', 'quickDrive', e.detail);
	};
	


	/**
	* add listeners for sbrick events
	* @returns {undefined}
	*/
	const addSBrickEventListeners = function() {
		body.addEventListener('setlights.sbrick', setlightsHandler),
		body.addEventListener('setdrive.sbrick', setdriveHandler);
		body.addEventListener('setservo.sbrick', setservoHandler);
	};



	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		window.mySBrick = window.mySBrick || new SBrick();
		mySBrick = window.mySBrick;
		addSBrickEventListeners();
	};




	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
