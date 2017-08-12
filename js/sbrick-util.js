/*
* specific helper functions for sbrick
*/
(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	/**
	* servo motor only supports 7 angles per 90 degrees
	* and these angles do not correspond linearly with power values
	* for every supported angle:
	*	angle: the angle in degrees
	*	powerMin: the minimum power value that rotates the servo motor to this angle
	*	powerMax: the maximum power value that rotates the servo motor to this angle
	*	power: a value somewhere between min and max, so we're sure we're in the right range
	*/
	const powerAngles = [
		{ angle: 0, power: 0, powerMin: 0, powerMax: 0},
		{ angle: 13, power: 10, powerMin: 1, powerMax: 19},
		{ angle: 26, power: 40, powerMin: 20, powerMax: 52},
		{ angle: 39, power: 70, powerMin: 53, powerMax: 83},
		{ angle: 52, power: 100, powerMin: 84, powerMax: 116},
		{ angle: 65, power: 130, powerMin: 117, powerMax: 145},
		{ angle: 78, power: 160, powerMin: 146, powerMax: 179},
		{ angle: 90, power: 200, powerMin: 180, powerMax: 255}
	];


	/**
	* translate servo's angle to corresponding power-value
	* @param {number} angle - The angle of the servo motor
	* @returns {number} The corresponding power value
	*/
	const servoAngleToPower = function(angle) {
		let power = 0;
		angle = parseInt(angle, 10);
		for (let i=0, len=powerAngles.length; i<len; i++) {
			const obj = powerAngles[i];
			if (angle === obj.angle) {
				power = obj.power;
				break;
			}
		}

		return power;
	};
	


	// now make functions available to outside world
	window.sbrickUtil = {
		servoAngleToPower
	};


})();