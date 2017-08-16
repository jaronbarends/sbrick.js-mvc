(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	const SBRICKNAME = 'SBrick';
		

	const PORTS = {
		PORT_TOP_LEFT: 0,
		PORT_BOTTOM_LEFT: 1,
		PORT_TOP_RIGHT: 2,
		PORT_BOTTOM_RIGHT: 3
	};

	let mySBrick,
	sensorTimer;



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
		// if (data.power !== 0) {
		// 	// drive does not seem to work below some power level
		// 	// define the power range within which the drive does work
		// 	const powerRange = mySBrick.MAX - MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK;
		// 	data.power = Math.round(powerRange * data.power/100 + MIN_VALUE_BELOW_WHICH_MOTOR_DOES_NOT_WORK);
		// }
		data.power = window.sbrickUtil.drivePercentageToPower(data.power);
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
	* get the indicator for which lights button is active
	* @param {number} data - The current values of the port ({portId, data, direction})
	* @returns {undefined}
	*/
	const getActiveLightsHrefValue = function(data) {
		let perc = Math.round(100*data.power/255);
		return perc;
	};



	/**
	* get the indicator for which lights button is active
	* @param {number} data - The current values of the port ({portId, data, direction})
	* @returns {undefined}
	*/
	const getActiveDriveHrefValue = function(data) {
		let perc = window.sbrickUtil.drivePowerToPercentage(data.power);
		if (data.direction === mySBrick.CCW) {
			perc = -1*perc;
		}
		return perc;
	};



	/**
	* get the indicator for which lights button is active
	* @param {number} data - The current values of the port ({portId, data, direction})
	* @returns {undefined}
	*/
	const getActiveServoHrefValue = function(data) {
		let angle = window.sbrickUtil.servoPowerToAngle(data.power);
		if (data.direction === mySBrick.CCW) {
			angle = -1*angle;
		}
		return angle;
	};
	


	/**
	* get the indicator for which button should be active now
	* @param {string} func - The function-type (lights, drive, servo)
	* @param {number} power - The current power value of the port
	* @returns {undefined}
	*/
	const getActiveHrefValue = function(func, data) {
		if (func === 'lights') {
			return getActiveLightsHrefValue(data);
		} else if (func === 'drive') {
			return getActiveDriveHrefValue(data);
		} else if (func === 'servo') {
			return getActiveServoHrefValue(data);
		}
	};
	


	/**
	* update which button is active when port value changes
	* @returns {undefined}
	*/
	const updateActiveButton = function(data) {
		const portId = data.portId,
			power = data.power,
			direction = data.direction;

		let portName;

		// check which type of function this is
		for (let portNm in PORTS) {
			if (PORTS[portNm] === portId) {
				portName = portNm;
			}
		}

		// console.log(power);

		const container = document.querySelector('.btn-list[data-port="'+portName+'"]');
		if (container) {
			const func = container.getAttribute('data-function'),
				links = Array.from(container.querySelectorAll('a'));
			let hrefValue = getActiveHrefValue(func, data);

			hrefValue = ''+hrefValue;// convert to string, for href has type of string

			links.forEach((link) => {
				if (hrefValue !== '' && link.getAttribute('href') === hrefValue) {
					link.classList.add('btn--is-active');
				} else {
					link.classList.remove('btn--is-active');
				}

			});
		}
	};
	



	/**
	* handle when port has changed
	* @param {event} e - change event sent by sbrick.js
	* @returns {undefined}
	*/
	const portchangeHandler = function(e) {
		let data = e.detail;
		// console.log(data);
		updateActiveButton(data);
		// we should update the controller when another script changes a value
		// i.e. set active state here
		// window.util.log('port change: portId:' + data.portId + ' pwr:' + data.power + ' dir:'+data.direction);
	};



	/**
	* handle when sensor has changed
	* @param {event} e - change event sent by sbrick.js
	* @returns {undefined}
	*/
	const sensorchangeHandler = function(e) {
		let data = e.detail;
	};

	

	/**
	* watch tilt sensor
	* @returns {undefined}
	*/
	// const watchTilt = function() {
	// 	let outputElm = document.getElementById('output--tilt1'),
	// 		portId = 3;
		
	// 	let counter = 0,
	// 		ch0 = document.getElementById('output-tilt-ch0'),
	// 		ch1 = document.getElementById('output-tilt-ch1'),
	// 		tiltVal = document.getElementById('output-tilt-val'),
	// 		measureInterval = 20,// interval between tilt measurements
	// 		maxMeasureTime = 50,// number of seconds we'll check tilt
	// 		maxMeasurementCount = 1000 * maxMeasureTime / measureInterval;

	// 	const getSensorData = function() {
	// 		clearTimeout(sensorTimer);

	// 		mySBrick.getSensor(3, 'wedo')
	// 			.then((m) => {
	// 				ch0.textContent = m.ch0_raw;
	// 				ch1.textContent = m.ch1_raw;
	// 				tiltVal.textContent = m.value;

	// 				counter++;
	// 				if (counter < maxMeasurementCount) {
	// 					sensorTimer = setTimeout(getSensorData, 20);
	// 				}
	// 			});
	// 	}

	// 	getSensorData();		
	// };


	/**
	* read sensor data and send event
	* @returns {undefined}
	*/
	const getSensorData = function() {
		clearTimeout(sensorTimer);

		let ch0 = document.getElementById('output-tilt-ch0'),
			ch1 = document.getElementById('output-tilt-ch1'),
			tiltVal = document.getElementById('output-tilt-val');

		mySBrick.getSensor(3, 'wedo')
			.then((m) => {
				// ch0.textContent = m.ch0_raw;
				// ch1.textContent = m.ch1_raw;
				// tiltVal.textContent = m.value;
				let sensorData = m;// { type, voltage, ch0_raw, ch1_raw }

				const event = new CustomEvent('sensorchange.sbrick', {detail: sensorData});
				document.body.dispatchEvent(event);
				sensorTimer = setTimeout(getSensorData, 20);
			});

	}

	

	/**
	* watch tilt sensor
	* @returns {undefined}
	*/
	const toggleSensor = function() {
		let outputElm = document.getElementById('output--tilt1'),
			portId = 3;
		
			// let counter = 0;
			// measureInterval = 20,// interval between tilt measurements
			// maxMeasureTime = 5,// number of seconds we'll check tilt
			// maxMeasurementCount = 1000 * maxMeasureTime / measureInterval;


		getSensorData();		
	};


	
	/**
	* initialize control buttons for ports
	* @returns {undefined}
	*/
	const initPortControls = function() {
		document.querySelectorAll('.btn-list').forEach((list) => {
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
			clearTimeout(sensorTimer);
		});
	};
	


	/**
	* initialize controlPanel
	* @returns {undefined}
	*/
	const initInfoControls = function() {
		// document.getElementById('watch-tilt').addEventListener('click', watchTilt);
		document.getElementById('toggle-sensor').addEventListener('click', toggleSensor);

		// set listeners for sbrick events
		document.body.addEventListener('portchange.sbrick', portchangeHandler);
		document.body.addEventListener('sensorchange.sbrick', sensorchangeHandler);
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
