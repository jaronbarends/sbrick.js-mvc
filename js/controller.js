(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick',
		MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK = 98;// somehow, motor does not seem to work for power values < 98

	let body = document.body,
		logWin,
		connectBtn,
		controlPanel,
		SBrick;



	/**
	* 
	* @returns {undefined}
	*/
	var checkTemperature = function() {
		SBrick.getTemp()
			.then( (value) => {
				value = Math.round(10*value)/10;
				log('Temperature: ' + value + '°C');
			});
	};


	/**
	* 
	* @returns {undefined}
	*/
	var getModelNumber = function() {
		SBrick.getModelNumber()
			.then( (value) => {
				// value = Math.round(10*value)/10;
				log('Model number: ' + value);
			})
			.catch( (e) => {
				log(e);
			});
	};


	/**
	* check current battery status
	* @returns {undefined}
	*/
	var checkBattery = function() {
		SBrick.getBattery()
			.then( (value) => {
				log('Battery: ' + value + '%');			
			});
	};
	

	/**
	* update a set of lights
	* @param {string} channelId - The number (0-3) of the channel this set of lights is attached to
	* @param {deviceId} string - An id for this attached set of lights, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateLights = function(channelId, deviceId) {
		let	power = document.getElementById(deviceId + '-power').value,
			direction = SBrick.CW,// we need a value
			channel = SBrick['CHANNEL'+channelId];

		power = Math.round(SBrick.MAX * power/100);

		console.log(channel, direction, power);
		log('Lights: ' + channelId + ', ' + direction + ', ' + power);

		SBrick.drive(channel, direction, power)
			.then( () => {
				// const c = SBrick.channel[channel];
				// console.log( 'channel ' + channelId +': power: ', c.power, 'direction: ', c.direction );
			});
	};


	/**
	* update a drive motor
	* @param {string} channelId - The number (0-3) of the channel this motor is attached to
	* @param {deviceId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateDrive = function(channelId, deviceId) {
		const powerRange = SBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
		let	power = document.getElementById(deviceId + '-power').value,
			// powerNumber = document.getElementById(deviceId + '-power-number').value,
			direction = document.querySelector('[name="' + deviceId + '-direction"]:checked').value,
			channel = SBrick['CHANNEL'+channelId];


		power = Math.round(powerRange * power/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
		// power = Math.round(SBrick.MAX * power/100);
		direction = SBrick[direction];

		// console.log(channel, direction, power);
		log('Drive: ', channelId, direction, power);

		SBrick.quickDrive([
				{
					channelId,
					direction,
					power
				}
			])
			.then( () => {
				// log('quickdrive worked');
			});
		// SBrick.drive(channel, direction, power);
	};


	/**
	* update a drive motor
	* @param {string} channelId - The number (0-3) of the channel this motor is attached to
	* @param {deviceId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateServo = function(channelId, deviceId) {
		const powerRange = SBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
		let	power = document.getElementById(deviceId + '-power').value,
			powerNumber = document.getElementById(deviceId + '-power-number').value,
			direction = document.querySelector('[name="' + deviceId + '-direction"]:checked').value,
			channel = SBrick['CHANNEL'+channelId];


		// power = Math.round(powerRange * power/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
		power = Math.round(SBrick.MAX * powerNumber/100);
		power = powerNumber;
		direction = SBrick[direction];

		console.log(channel, direction, power);
		log('Drive: ' + channelId + ', ' + direction + ', ' + power);

		// SBrick.quickDrive([
		// 	{channel, direction, power}
		// ]);
		SBrick.drive(channel, direction, power);
	};
	
	
	

	/**
	* handle click on channel - call function for connected type of device (lights, drive motor, servo, ...)
	* @returns {undefined}
	*/
	const channelBtnHandler = function(e) {
		const btn = e.target,
			channelId = btn.getAttribute('data-channel'),
			deviceType = btn.getAttribute('data-device-type'),
			deviceId = btn.getAttribute('data-device-id');

		if (deviceType === 'lights') {
			updateLights(channelId, deviceId);
		} else if (deviceType === 'drive') {
			updateDrive(channelId, deviceId);
		} else if (deviceType === 'servo') {
			updateServo(channelId, deviceId);
		}
	};


	/**
	* set the lights to a new value
	* @returns {undefined}
	*/
	const setLights = function(e) {
		e.preventDefault();
		let data = {
				channelId: 0,
				direction: 0,
				power: 100
			},
			event = new CustomEvent('setlights.sbrick', { detail: data});
		body.dispatchEvent(event);
	};


	/**
	* handle when lights have changed
	* @returns {undefined}
	*/
	const lightschangeHandler = function(e) {
		let data = e.detail;
		log('handle chId:' + data.channelId + ' p:' + data.power + ' dir:'+data.direction);
	};
	
	
	


	/**
	* initialize controlPanel
	* @returns {undefined}
	*/
	const initControlPanel = function() {
		const channelBtns = Array.from(document.querySelectorAll('button[data-channel]'));
		channelBtns.forEach( (btn) => {
			btn.addEventListener('click', channelBtnHandler);
		});

		document.getElementById('stop-all').addEventListener('click', () => { SBrick.stopAll(); });
		document.getElementById('check-battery-btn').addEventListener('click', checkBattery);
		document.getElementById('check-temperature-btn').addEventListener('click', checkTemperature);
		document.getElementById('check-model-number-btn').addEventListener('click', getModelNumber);

		document.getElementById('setlights').addEventListener('click', setLights);

		// set listeners for sbrick events
		body.addEventListener('lightschange.sbrick', lightschangeHandler);
	};


	/**
	* connect the sbrick
	* @returns {undefined}
	*/
	var connectSBrick = function() {
		SBrick.connect(SBRICKNAME)
		.then( (value) => {
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
		.then( (value) => {
			// SBrick now is disconnected
			log('SBrick is now disconnected', value);
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
	let log = function(...msg) {// use let instead of const so we can reassign to console.log
		msg = msg.join(', ');
		logWin.innerHTML += '<p>' + msg + '</p>';
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
			// SBrick = window.SBrickDummy;
			// log = console.log;
		}

		logWin = document.getElementById('log-window');
		connectBtn = document.getElementById('connect-btn');
		controlPanel = document.getElementById('controlPanel');

		// initialize controlPanel - they'll remain hidden until connection is made
		initControlPanel();

		// Connect to SBrick via bluetooth.
		// Per the specs, this has to be done IN RESPONSE TO A USER ACTION
		connectBtn.addEventListener('click', connectHandler);

		document.getElementById('version-number').textContent = 'v0.43';
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
