(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick';

	let body = document.body,
		logWin,
		SBrick;
	


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
		// console.log('setlightsHandler', e);
		const data = e.detail;
		// console.log(data);

		SBrick.drive(data.channelId, data.direction, data.power)
			.then( (data) => {
				// log('yay! chId:' + obj.channelId + ' p:' + obj.power + ' dir:'+obj.direction);
				// all went well, sent an event with the new channel values
				const event = new CustomEvent('lightschange.sbrick', {detail: data});
				body.dispatchEvent(event);
			});
	};
	


	/**
	* add listeners for sbrick events
	* @returns {undefined}
	*/
	const addSBrickEventListeners = function() {
		body.addEventListener('setlights.sbrick', setlightsHandler);
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
