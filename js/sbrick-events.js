(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick';

	let body = document.body,
		logWin,
		SBrick,
		defaultDriveData;
	

	/**
	* log to page's log window
	* @returns {undefined}
	*/
	let log = function(...msg) {// use let instead of const so we can reassign to console.log
		msg = msg.join(', ');
		logWin.innerHTML += '<p>' + msg + '</p>';
	};


	/**
	* pass request to change lights to sbrick.js
	* @returns {undefined}
	*/
	const setlightsHandler = function(e) {
		// make sure we always have values to send
		let data = Object.assign({}, defaultDriveData, e.detail);

		// send drive instructions
		SBrick.drive(data.channelId, data.direction, data.power)
			.then( (data) => {
				// all went well, sent an event with the new channel values
				const event = new CustomEvent('lightschange.sbrick', {detail: data});
				body.dispatchEvent(event);
			});
	};



	/**
	* pass request to change drive to sbrick.js
	* @returns {undefined}
	*/
	const setdriveHandler = function(e) {
		let data = Object.assign({}, defaultDriveData, e.detail);// make sure we always have values to send

		// send drive instructions
		SBrick.quickDrive([data])
			.then( (data) => {
				// all went well, sent an event with the new channel values
				const event = new CustomEvent('drivechange.sbrick', {detail: data});
				body.dispatchEvent(event);
			});
	};
	


	/**
	* add listeners for sbrick events
	* @returns {undefined}
	*/
	const addSBrickEventListeners = function() {
		body.addEventListener('setlights.sbrick', setlightsHandler),
		body.addEventListener('setdrive.sbrick', setdriveHandler);
	};



	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		SBrick = window.SBrick;
		logWin = document.getElementById('log-window');

		// define default data to send to drive commands
		defaultDriveData = {
			channelId: 0,
			direction: SBrick.CW,
			power: 0
		};
		addSBrickEventListeners();
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
