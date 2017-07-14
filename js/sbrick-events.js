(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	let body = document.body,
		mySBrick,
		defaultDriveData;
	


	/**
	* send event after a function (motor, servo, lights) has changed
	* @param {string} eventName - The name of the event to send
	* @param {object} returnedData - The data returned from the bluetooth call
	* @returns {undefined}
	*/
	const sendChangeEvent = function(eventName, returnedData) {
		// all went well, sent an event with the newly returned port values
		const event = new CustomEvent(eventName, {detail: returnedData});
		body.dispatchEvent(event);
	};


	// generic way of sending commands can be used when drive method accepts param
	// in same format as quickDrive.
	// now: drive(portId, direction, power)
	// 		quickDrive( [{portId, direction, power}, {portId, direction, power}])
	// you would want the drive method to be passed an object as well.

	/**
	* send a command to the sbrick
	* @returns {undefined}
	*/
	// const sendCommand = function(eventName, command, data) {
	// 	// make sure we always have values to send
	// 	// define default data to send to drive commands
	// 	let defaultDriveData = {
	// 		portId: 0,
	// 		direction: mySBrick.CW,
	// 		power: 0
	// 	};

	// 	let dataToSend = Object.assign({}, defaultDriveData, data);

	// 	// send drive instructions
	// 	mySBrick.drive(dataToSend.portId, dataToSend.direction, dataToSend.power)
	// 		.then( (returnedData) => {
	// 			// all went well, sent an event with the new port values
	// 			sendChangeEvent(eventName, returnedData);
	// 		});
	// };
	


	/**
	* pass request to change lights to sbrick.js
	* @returns {undefined}
	*/
	// const setlightsHandlerGeneric = function(e) {
	// 	sendCommand('lightschange.sbrick', 'drive', e.detail);
	// };



	/**
	* pass request to change lights to sbrick.js
	* @returns {undefined}
	*/
	const setlightsHandler = function(e) {
		// make sure we always have values to send
		let data = Object.assign({}, defaultDriveData, e.detail),
			eventName = 'lightschange.sbrick';

		// send drive instructions
		mySBrick.drive(data.portId, data.direction, data.power)
			.then( (returnedData) => {
				// all went well, sent an event with the new port values
				sendChangeEvent(eventName, returnedData);
			});
	};
	


	/**
	* pass request to change drive to sbrick.js
	* @returns {undefined}
	*/
	const setdriveHandler = function(e) {
		let data = Object.assign({}, defaultDriveData, e.detail),// make sure we always have values to send
			eventName = 'drivechange.sbrick';

		// send drive instructions
		mySBrick.quickDrive([data])
			.then( (returnedData) => {
				// all went well, sent an event with the newly returned port values
				sendChangeEvent(eventName, returnedData);
			});
	};



	/**
	* pass request to change servo to sbrick.js
	* @returns {undefined}
	*/
	const setservoHandler = function(e) {
		let data = Object.assign({}, defaultDriveData, e.detail),// make sure we always have values to send
			eventName = 'servochange.sbrick';

		// send drive instructions
		mySBrick.quickDrive([data])
			.then( (returnedData) => {
				// all went well, sent an event with the new port values
				sendChangeEvent(eventName, returnedData);
			});
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

		// define default data to send to drive commands
		defaultDriveData = {
			portId: 0,
			direction: mySBrick.CW,
			power: 0
		};
		addSBrickEventListeners();
	};





	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
