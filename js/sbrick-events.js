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
	* pass setting of lights to sbrick.js
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
	* pass setting of lights to sbrick.js
	* @returns {undefined}
	*/
	const setdriveHandler = function(e) {
		// make sure we always have values to send
		log('driveHandler');
		let data = Object.assign({}, defaultDriveData, e.detail);

		// send drive instructions
		SBrick.drive(data.channelId, data.direction, data.power)
			.then( (data) => {
				// all went well, sent an event with the new channel values
				// const event = new CustomEvent('lightschange.sbrick', {detail: data});
				// body.dispatchEvent(event);
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

		let dummyMode = false;

		// check if we're on http; if so, use the real sbrick
		// otherwise, talk against the dummy
		if (window.location.href.indexOf('http') !== 0) {
			dummyMode = true;
		}

		// define default data to send to drive commands
		defaultDriveData = {
			channelId: 0,
			direction: SBrick.CW,
			power: 0
		};

		if (dummyMode) {
			SBrick = window.SBrickDummy;
			log = console.log;
		}

		logWin = document.getElementById('log-window');

		addSBrickEventListeners();
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
