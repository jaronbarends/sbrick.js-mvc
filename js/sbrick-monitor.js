(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var

	let body = document.body,
		monitor,
		elms = [];


	/**
	* show a ports state
	* @returns {undefined}
	*/
	const showState = function(portObj) {
		tds = elms[portObj.portId];
		tds.power.textContent = portObj.power;
		if (tds.direction) {
			let dir = '';
			if (portObj.power !== 0) {
				dir = (portObj.direction === 0 ? 'cw' : 'ccw');
			}
			tds.direction.textContent = dir;
		}
	};
	


	/**
	* handle change of lights
	* @returns {undefined}
	*/
	const portchangeHandler = function(e) {
		let portObjs = e.detail;
		if (!Array.isArray(portObjs)) {
			portObjs = [portObjs];
		}

		portObjs.forEach((portObj) => {
			showState(portObj);
		});

	};
	

	/**
	* add listeners for changed ports
	* @returns {undefined}
	*/
	const addEventListeners = function() {
		body.addEventListener('portchange.sbrick', portchangeHandler);
	};
	


	/**
	* initialize all functionality
	* @param {string} varname - Description
	* @returns {undefined}
	*/
	const init = function() {
		monitor = document.getElementById('monitor');

		for (let i=0; i<4; i++) {
			const power = document.getElementById('monitor-port-'+i+'-power'),
				direction = document.getElementById('monitor-port-'+i+'-direction');
			elms.push( {
				power,
				direction
			});
		}
		addEventListeners();
	};




	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();
