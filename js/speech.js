(() => {

	var create_email = false;
	var final_transcript = '';
	var isRecording = false;
	var ignore_onend;
	var start_timestamp;
	var recognition;
	var start_button = document.getElementById('start_button');
	var start_img = document.getElementById('start_img');
	var final_span = document.getElementById('final_span');
	var interim_span = document.getElementById('interim_span');
	var info = document.getElementById('info');
	var mySBrick;


	/**
	* 
	* @returns {undefined}
	*/
	var initRecognition = function() {
		start_button.style.display = 'inline-block';
		var recognition = new webkitSpeechRecognition();

		// recognition.continuous = true;// when set to true, accepts multiple results - Does not seem to work well on Android
		recognition.interimResults = true;
		recognition.lang = 'en-US';
		// recognition.lang = 'nl-NL';



		recognition.onstart = function() {
			isRecording = true;
			start_img.src = 'img/mic-animate.gif';
		};



		recognition.onerror = function(event) {
			if (event.error === 'no-speech') {
				start_img.src = 'img/mic.gif';
				showInfo('info_no_speech');
				ignore_onend = true;
			}
			if (event.error === 'audio-capture') {
				start_img.src = 'img/mic.gif';
				showInfo('info_no_microphone');
				ignore_onend = true;
			}
			if (event.error === 'not-allowed') {
				if (event.timeStamp - start_timestamp < 100) {
					showInfo('info_blocked');
				} else {
					showInfo('info_denied');
				}
				ignore_onend = true;
			}
		};



		recognition.onend = function() {
			isRecording = false;
			if (ignore_onend) {
				return;
			}
			start_img.src = 'img/mic.gif';
			if (!final_transcript) {
				showInfo('info_start');
				return;
			}
		};


		recognition.onresult = function(event) {
			var interim_transcript = '';

			// error checking
			if (typeof(event.results) === 'undefined') {
				recognition.onend = null;
				recognition.stop();
				upgrade();
				return;
			}

			// console.log(event);

			for (var i = event.resultIndex; i < event.results.length; ++i) {
				if (event.results[i].isFinal) {
					final_transcript += event.results[i][0].transcript;
				} else {
					interim_transcript += event.results[i][0].transcript;
				}
			}

			final_span.innerHTML = final_transcript;
			interim_span.innerHTML = interim_transcript;
			if (final_transcript || interim_transcript) {
				// there is a result - but we're not done yet
			}

			if (final_transcript) {
				const eventData = {
					command: final_transcript
				};
				const event = new CustomEvent('voicecommand', {detail: eventData});
				document.body.dispatchEvent(event);
			}

		};

		return recognition;
	};

	function upgrade() {
		alert('Sorry, your browser does not support all functionality we need. Please update your browser');
	}


	function startButton(event) {
		if (isRecording) {
			recognition.stop();
			return;
		}
		final_transcript = '';

		recognition.start();
		ignore_onend = false;
		final_span.innerHTML = '';
		interim_span.innerHTML = '';
		start_img.src = 'img/mic-slash.gif';
		start_timestamp = event.timeStamp;
	}


	// show info div with content defined by id
	function showInfo(id) {
		if (id) {
			for (var child = info.firstChild; child; child = child.nextSibling) {
				if (child.style) {
					child.style.display = child.id == id ? 'inline' : 'none';
				}
			}
			info.style.visibility = 'visible';
		} else {
			info.style.visibility = 'hidden';
		}
	}


	/**
	* add logging for all kind of events
	* @returns {undefined}
	*/
	// BEWARE: ADDING THESE EVENTS OVERRIDES THE PREVIOUS EVENTHANDLERS
	// WHICH ARE PRETTY IMPORTANT FOR, LIKE, onstart, onresult AND onend...
	var addEventLogging = function() {
		var eventsToLog = [
			'onaudiostart',
			'onaudioend',
			'onsoundstart',
			'onsoundend',
			'onspeechstart',
			'onspeechend',
			// 'onstart',
			// 'onend',
			// 'onerror',
			'onnomatch',
			// 'onresult'
		];

		eventsToLog.forEach((eventName) => {
			recognition[eventName] = function(e) {
				console.log(eventName);
			};
		});
	};



	/**
	* initialize all
	* @returns {undefined}
	*/
	var init = function() {
		if (!('webkitSpeechRecognition' in window)) {
			upgrade();
		} else {
			recognition = initRecognition();
			start_button.addEventListener('click', startButton);
		}

		// addEventLogging();

	};

	// kick of the script when all dom content has loaded
	document.addEventListener('DOMContentLoaded', init);

})();