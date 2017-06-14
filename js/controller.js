(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick';
	let logWin;



	/**
	* 
	* @returns {undefined}
	*/
	var checkTemperature = function() {
		SBrick.getTemp()
			.then( (value) => {
				value = Math.round(10*value)/10;
				log('Temperature: ' + value + '&deg;C');
			});
	};


	/**
	* 
	* @returns {undefined}
	*/
	var checkBattery = function() {
		SBrick.getBattery()
			.then( (value) => {
				log('Battery: ' + value + '%');			
			});
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel0Handler = function() {
		SBrick.drive(SBrick.CHANNEL0, SBrick.CW, SBrick.MAX);
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel1Handler = function() {
		SBrick.drive(SBrick.CHANNEL1, SBrick.CW, SBrick.MAX);
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel2Handler = function() {
		SBrick.drive(SBrick.CHANNEL2, SBrick.CW, SBrick.MAX);
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel3Handler = function() {
		SBrick.drive(SBrick.CHANNEL3, SBrick.CW, SBrick.MAX);
	};
	
	


	/**
	* initialize controls
	* @returns {undefined}
	*/
	const initControls = function() {
		document.getElementById('check-battery-btn').addEventListener('click', checkBattery);
		document.getElementById('check-temperature-btn').addEventListener('click', checkTemperature);
		document.getElementById('channel-0').addEventListener('click', channel0Handler);
		document.getElementById('channel-1').addEventListener('click', channel1Handler);
		document.getElementById('channel-2').addEventListener('click', channel2Handler);
		document.getElementById('channel-3').addEventListener('click', channel3Handler);
		document.getElementById('stop-all').addEventListener('click', () => { SBrick.stopAll(); });
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
			log('SBrick is now Connected');
			initControls();
		} )
		.catch( (e) => {
			log('Caught error in SBrick.connect: ' + e);
		});
	};
	


	/**
	* log to page's log window
	* @returns {undefined}
	*/
	const log = function(msg) {
		logWin.innerHTML += '<p>' + msg + '</p>';
	};

	

	/**
	* initialize all
	* @param {string} varname Description
	* @returns {undefined}
	*/
	const init = function() {
		logWin = document.getElementById('log-window');
		// Connect to SBrick via bluetooth.
		// Per the specs, this has to be done IN RESPONSE TO A USER ACTION
		document.getElementById('connect-btn').addEventListener('click', connectSBrick);
	};

	document.addEventListener('DOMContentLoaded', init);

})();
