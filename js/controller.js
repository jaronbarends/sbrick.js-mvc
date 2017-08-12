(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick',
		MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK = 98;// somehow, motor does not seem to work for power values < 98

	const PORTS = {
		PORT_TOP_LEFT: 0,
		PORT_BOTTOM_LEFT: 1,
		PORT_TOP_RIGHT: 2,
		PORT_BOTTOM_RIGHT: 3
	};

	let mySBrick;



	/**
	* update a set of lights
	* @param {string} portId - The number (0-3) of the port this set of lights is attached to
	* @param {funcId} string - An id for this attached set of lights, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const setLights = function(data) {
		data.power = Math.round(mySBrick.MAX * data.power/100);
		mySBrick.drive(data);
	};



	/**
	* update a drive motor
	* @param {string} portId - The number (0-3) of the port this motor is attached to
	* @param {funcId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const setDrive = function(data) {
		if (data.power !== 0) {
			// drive does not seem to work below some power level
			// define the power range within which the drive does work
			const powerRange = mySBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
			data.power = Math.round(powerRange * data.power/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
		}
		mySBrick.drive(data);
	};



	/**
	* update a servo motor
	* @param {string} portId - The number (0-3) of the port this motor is attached to
	* @param {funcId} string - An id for this attached motor, corresponding to id's in html to retrieve input values
	* @returns {undefined}
	*/
	const setServo = function(data) {
		// data.power = Math.round(mySBrick.MAX * data.power/100);
		data.power = window.sbrickUtil.servoAngleToPower(data.power);
		mySBrick.drive(data);
	};



	/**
	* handle when port has changed
	* @param {event} e - change event sent by sbrick.js
	* @returns {undefined}
	*/
	const portchangeHandler = function(e) {
		let data = e.detail;
		// we should update the controller when another the values change
		// i.e. set active state here
		// window.util.log('port change: portId:' + data.portId + ' pwr:' + data.power + ' dir:'+data.direction);
	};

	

	/**
	* watch tilt sensor
	* @returns {undefined}
	*/
	const watchTilt = function() {
		let outputElm = document.getElementById('output--tilt1'),
			portId = 3;
		
		let counter = 0,
			sensorTimer,
			ch0 = document.getElementById('output-tilt-ch0'),
			ch1 = document.getElementById('output-tilt-ch1'),
			tiltVal = document.getElementById('output-tilt-val'),
			measureInterval = 20,// interval between tilt measurements
			maxMeasureTime = 50,// number of seconds we'll check tilt
			maxMeasurementCount = 1000 * maxMeasureTime / measureInterval;

		const getSensorData = function() {
			clearTimeout(sensorTimer);

			mySBrick.getSensor(3, 'wedo')
				.then((m) => {
					ch0.textContent = m.ch0_raw;
					ch1.textContent = m.ch1_raw;
					tiltVal.textContent = m.value;

					counter++;
					if (counter < maxMeasurementCount) {
						sensorTimer = setTimeout(getSensorData, 20);
					}
				});
		}

		getSensorData();		
	};


	
	/**
	* initialize control buttons for ports
	* @returns {undefined}
	*/
	const initPortControls = function() {
		document.querySelectorAll('.buttons-list').forEach((list) => {
			const portName = list.getAttribute('data-port'),
				func = list.getAttribute('data-function');

			list.querySelectorAll('a').forEach((button) => {
				button.addEventListener('click', (e) => {
					e.preventDefault();
					const valueStr = e.target.getAttribute('href');
					const data = {
						portId: PORTS[portName],
						power: Math.abs(parseInt(valueStr, 10)),
						direction: valueStr.indexOf('-') === 0 ? mySBrick.CCW : mySBrick.CW
					};

					switch (func) {
						case 'lights':
							setLights(data);
							break;
						case 'drive':
							setDrive(data);
							break;
						case 'servo':
							setServo(data);
							break;
					}

				});// eventListener
			});// forEach(btn)
		});// forEach(list)

		document.getElementById('stop-all').addEventListener('click', () => {
			mySBrick.stopAll();
		});
	};
	


	/**
	* initialize controlPanel
	* @returns {undefined}
	*/
	const initInfoControls = function() {
		document.getElementById('watch-tilt').addEventListener('click', watchTilt);

		// set listeners for port events
		document.body.addEventListener('portchange.sbrick', portchangeHandler);
	};



	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		window.mySBrick = window.mySBrick || new SBrick();
		mySBrick = window.mySBrick;

		initInfoControls();
		initPortControls();
	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
