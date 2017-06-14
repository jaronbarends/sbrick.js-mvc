(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick';
	let logWin,
		connectBtn,
		controlPanel;



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
		SBrick.drive(SBrick.CHANNEL1, SBrick.CW, -1*SBrick.MAX);
	};
	

	/**
	* 
	* @returns {undefined}
	*/
	const channel3Handler = function() {
		SBrick.drive(SBrick.CHANNEL3, SBrick.CW, SBrick.MAX);
	};
	
	


	/**
	* initialize controlPanel
	* @returns {undefined}
	*/
	const initControlPanel = function() {
		document.getElementById('check-battery-btn').addEventListener('click', checkBattery);
		document.getElementById('check-temperature-btn').addEventListener('click', checkTemperature);
		document.getElementById('channel-0').addEventListener('click', channel0Handler);
		document.getElementById('channel-1').addEventListener('click', channel1Handler);
		document.getElementById('channel-2').addEventListener('click', channel2Handler);
		document.getElementById('channel-3').addEventListener('click', channel3Handler);
		document.getElementById('stop-all').addEventListener('click', () => { SBrick.stopAll(); });
	};


	/**
	* connect the sbrick
	* @returns {undefined}
	*/
	var connectSBrick = function() {
		SBrick.connect(SBRICKNAME)
		.then( () => {
			// SBrick now is connected
			log('SBrick is now Connected');
			updateConnectionState();
		} )
		.catch( (e) => {
			log('Caught error in SBrick.connect: ' + e);
			updateConnectionState();
		});
	};


	/**
	* disconnect the sbrick
	* @returns {undefined}
	*/
	var disconnectSBrick = function() {
		SBrick.disconnect(SBRICKNAME)
		.then( () => {
			// SBrick now is disconnected
			log('SBrick is now disconnected');
			updateConnectionState();
		} )
		.catch( (e) => {
			// something went wrong
			log('Caught error in SBrick.disconnect: ' + e);
			updateConnectionState();
		});
	};
	


	/**
	* update the connect button and control panel
	* @returns {undefined}
	*/
	const updateConnectionState = function() {
		if (SBrick.isConnected()) {
			connectBtn.classList.remove('btn--is-busy', 'btn--start');
			connectBtn.classList.add('btn--stop');
			connectBtn.innerHTML = 'Disconnect';
			controlPanel.classList.remove('is-hidden');
		} else {
			// disconnected
			connectBtn.classList.remove('btn--is-busy', 'btn--stop');
			connectBtn.classList.add('btn--start');
			connectBtn.innerHTML = 'Connect';
			controlPanel.classList.add('is-hidden');
		}
	};
	
	


	/**
	* connect or disconnect the SBrick
	* @returns {undefined}
	*/
	const connectHandler = function() {
		connectBtn.classList.add('btn--is-busy');

		if (SBrick.isConnected()) {
			disconnectSBrick();
		} else {
			connectSBrick();
		}
	};
	


	/**
	* log to page's log window
	* @returns {undefined}
	*/
	const log = function(msg) {
		logWin.innerHTML += '<p>' + msg + '</p>';
	};

	

	/**
	* initialize all functionality
	* @param {string} varname Description
	* @returns {undefined}
	*/
	const init = function() {
		logWin = document.getElementById('log-window');
		connectBtn = document.getElementById('connect-btn');
		controlPanel = document.getElementById('controlPanel');

		// initialize controlPanel - they'll remain hidden until connection is made
		initControlPanel();

		// Connect to SBrick via bluetooth.
		// Per the specs, this has to be done IN RESPONSE TO A USER ACTION
		connectBtn.addEventListener('click', connectHandler);

		log('B');
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
