(() => {

	// (optional) tell jshint about globals (they should remain commented out)
	/* globals SBrick */ //Tell jshint someGlobalVar exists as global var


	const logWin = document.getElementById('log-window');

	/**
	* log to page's log window
	* @returns {undefined}
	*/
	let log = function(...msg) {// use let instead of const so we can reassign to console.log
		msg = msg.join(', ');
		logWin.innerHTML += '<p>' + msg + '</p>';
	};


	/**
	* make first letter uppercase
	* @returns {undefined}
	*/
	const capitalize = function(str) {
		return str.charAt(0).toUpperCase() + str.substr(1);
	};
	




	// now make functions available to outside world
	window.util = {
		capitalize,
		log
	};


})();