(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick',
		MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK = 98;// somehow, motor does not seem to work for power values < 98

	let body = document.body,
		logWin,
		connectBtn,
		controlPanel,
		mySBrick;



	/**
	* 
	* @returns {undefined}
	*/
	var checkTemperature = function() {
		mySBrick.getTemp()
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
		mySBrick.getModelNumber()
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
		mySBrick.getBattery()
			.then( (value) => {
				log('Battery: ' + value + '%');			
			});
	};
	


	/**
	* update a set of lights
	* @param {string} portId - The number (0-3) of the port this set of lights is attached to
	* @param {funcId} string - An id for this attached set of lights, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateLights = function(portId, funcId) {
		let	power = document.getElementById(funcId + '-power').value;

		portId = parseInt(portId, 10);
		power = Math.round(mySBrick.MAX * power/100);

		let data = {
				portId,
				power
			},
			event = new CustomEvent('setlights.sbrick', {detail: data});
		body.dispatchEvent(event);
	};



	/**
	* update a drive motor
	* @param {string} portId - The number (0-3) of the port this motor is attached to
	* @param {funcId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateDrive = function(portId, funcId) {
		// drive does not seem to work below some power level
		// define the power range within which the drive does work
		const powerRange = mySBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;

		let	power = document.getElementById(funcId + '-power').value,
			directionStr = document.querySelector('[name="' + funcId + '-direction"]:checked').value,
			direction = mySBrick[directionStr];

		portId = parseInt(portId, 10);
		power = Math.round(powerRange * power/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);

		// define data to send
		let data = {
				port: portId,
				// portId: portId,
				direction,
				power
			},
			event = new CustomEvent('setdrive.sbrick', {detail: data});
			console.log(data);
		body.dispatchEvent(event);
	};



	/**
	* update a servo motor
	* @param {string} portId - The number (0-3) of the port this motor is attached to
	* @param {funcId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const updateServo = function(portId, funcId) {
		let	power = document.getElementById(funcId + '-power').value,
			powerNumber = document.getElementById(funcId + '-power-number').value,
			directionStr = document.querySelector('[name="' + funcId + '-direction"]:checked').value,
			direction = mySBrick[directionStr];
		
		portId = parseInt(portId, 10);
		power = Math.round(mySBrick.MAX * powerNumber/100);
		power = powerNumber;

		let data = {
				port: portId,
				// portId: portId,
				direction,
				power
			},
			event = new CustomEvent('setservo.sbrick', {detail: data});
		body.dispatchEvent(event);

		// console.log(port, direction, power);
		// log('Drive: ' + portId + ', ' + direction + ', ' + power);

		// mySBrick.quickDrive([
		// 	{port, direction, power}
		// ]);
		// mySBrick.drive(port, direction, power);
	};
	
	
	

	/**
	* handle click on port-button - call function for connected type of function (lights, drive motor, servo, ...)
	* @returns {undefined}
	*/
	const portBtnHandler = function(e) {
		const btn = e.target,
			portId = btn.getAttribute('data-port'),
			funcType = btn.getAttribute('data-func-type'),
			funcId = btn.getAttribute('data-func-id');

		if (funcType === 'lights') {
			updateLights(portId, funcId);
		} else if (funcType === 'drive') {
			updateDrive(portId, funcId);
		} else if (funcType === 'servo') {
			updateServo(portId, funcId);
		}
	};


	/**
	* set the lights to a new value
	* @returns {undefined}
	*/
	const setDrive = function(e) {
		e.preventDefault();
		let data = {
				port: 1,
				// portId: 1,
				direction: 0,
				power: 150
			},
			event = new CustomEvent('setdrive.sbrick', {detail: data});
		body.dispatchEvent(event);
	};


	/**
	* handle when lights have changed
	* @returns {undefined}
	*/
	const lightschangeHandler = function(e) {
		// TODO: make sbrick.js return port info as last then()
		// so we receive it here when data is sent by events
		let data = e.detail;
		log('lightschangeHandler');
		// log('lights change: chId:' + data.portId + ' p:' + data.power + ' dir:'+data.direction);
	};


	/**
	* handle when drive have changed
	* @returns {undefined}
	*/
	const drivechangeHandler = function(e) {
		// TODO: make sbrick.js return port info as last then()
		// so we receive it here when data is sent by events
		let data = e.detail;
		log('drivechangeHandler');
		// TODO: re-enable when sbrick.js returns port info
		// data.forEach((ch) => {
		// 	log('drive change: chId:' + ch.portId + ' p:' + ch.power + ' dir:'+ch.direction);
		// });
	};



	/**
	* handle when servo have changed
	* @returns {undefined}
	*/
	const servochangeHandler = function(e) {
		// TODO: make sbrick.js return port info as last then()
		// so we receive it here when data is sent by events
		let data = e.detail;
		log('servochangeHandler');
		// TODO: re-enable when sbrick.js returns port info
		// data.forEach((ch) => {
		// 	log('servo change: chId:' + ch.portId + ' p:' + ch.power + ' dir:'+ch.direction);
		// });
	};


	


	/**
	* watch tilt sensor
	* @returns {undefined}
	*/
	const watchTilt = function() {
		log('watch');
		let outputElm = document.getElementById('output--tilt1'),
			portId = 3;
		
		let counter = 0,
			sensorTimer,
			ch0 = document.getElementById('output-tilt-ch0');
			ch1 = document.getElementById('output-tilt-ch1');

		const getSensorData = function() {
			clearTimeout(sensorTimer);

			mySBrick.getSensor(3)
				.then((m) => {
					ch0.textContent = m.ch0;
					ch1.textContent = m.ch1;

					counter++;
					if (counter < 2000) {
						sensorTimer = setTimeout(getSensorData, 20);
					}
				});
		}

		getSensorData();		
	};


	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setPageBusy = function() {
		body.classList.add('page--is-busy');
	};


	/**
	* set the page to busy state
	* @returns {undefined}
	*/
	const setPageIdle = function() {
		body.classList.remove('page--is-busy');
	};
	
	
	


	/**
	* initialize controlPanel
	* @returns {undefined}
	*/
	const initControlPanel = function() {
		const portBtns = Array.from(document.querySelectorAll('button[data-port]'));
		portBtns.forEach( (btn) => {
			btn.addEventListener('click', portBtnHandler);
		});

		document.getElementById('stop-all').addEventListener('click', () => { mySBrick.stopAll(); });
		document.getElementById('check-battery-btn').addEventListener('click', checkBattery);
		document.getElementById('check-temperature-btn').addEventListener('click', checkTemperature);
		document.getElementById('check-model-number-btn').addEventListener('click', getModelNumber);

		document.getElementById('watch-tilt').addEventListener('click', watchTilt);

		// set listeners for sbrick events
		body.addEventListener('lightschange.sbrick', lightschangeHandler);
		body.addEventListener('drivechange.sbrick', drivechangeHandler);
		body.addEventListener('servochange.sbrick', servochangeHandler);
	};


	/**
	* connect the sbrick
	* @returns {undefined}
	*/
	var connectSBrick = function() {
		setPageBusy();
		mySBrick.connect(SBRICKNAME)
		.then( (value) => {
			// SBrick now is connected
			setPageIdle();
			log('SBrick is now Connected');
			updateConnectionState();
		} )
		.catch( (e) => {
			setPageIdle();
			log('Caught error in SBrick.connect: ' + e);
			updateConnectionState();
		});
	};


	/**
	* disconnect the sbrick
	* @returns {undefined}
	*/
	var disconnectSBrick = function() {
		setPageBusy();
		mySBrick.disconnect(SBRICKNAME)
		.then( (value) => {
			// SBrick now is disconnected
			setPageIdle();
			log('SBrick is now disconnected', value);
			updateConnectionState();
		} )
		.catch( (e) => {
			// something went wrong
			setPageIdle();
			log('Caught error in SBrick.disconnect: ' + e);
			updateConnectionState();
		});
	};
	


	/**
	* update the connect button and control panel
	* @returns {undefined}
	*/
	const updateConnectionState = function() {
		if (mySBrick.isConnected()) {
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

		if (mySBrick.isConnected()) {
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
	* make the app run in dummy mode - webbluetooth calls will be handled by dummy code that always resolves the call
	* @returns {undefined}
	*/
	const enableDummyMode = function() {
		mySBrick.webbluetooth = new WebBluetoothDummy();
		mySBrick.getFirmwareVersion = function() {
			return new Promise( (resolve, reject) => {
				resolve(4.17);
			});
		};
		log = console.log;
	};
	


	/**
	* check if we want to run in dummy-mode
	* that's meant for developing when you do not need to have an actual bluetooth device
	* @returns {undefined}
	*/
	const checkDummyMode = function() {
		// check if we're on http; if so, use the real webbluetooth api
		// otherwise, talk against the dummy
		if (window.location.href.indexOf('http') !== 0) {
			enableDummyMode();
		}
	};

	

	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		window.mySBrick = window.mySBrick || new SBrick();
		mySBrick = window.mySBrick;
		logWin = document.getElementById('log-window');
		connectBtn = document.getElementById('connect-btn');
		controlPanel = document.getElementById('controlPanel');

		// initialize controlPanel - they'll remain hidden until connection is made
		initControlPanel();

		checkDummyMode();

		// Connect to SBrick via bluetooth.
		// Per the specs, this has to be done IN RESPONSE TO A USER ACTION
		connectBtn.addEventListener('click', connectHandler);
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
