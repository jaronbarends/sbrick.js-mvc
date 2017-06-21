/*
 * Copyright (c) 2016-17 Francesco Marino
 *
 * @author Francesco Marino <francesco@360fun.net>
 * @website www.360fun.net
 *
 * Requires bluetooth.js and promise-queue library
 * https://github.com/360fun/bluetooth.js
 * https://github.com/azproduction/promise-queue
 *
 * This code is compatible with SBrick Protocol 4.17
 * https://social.sbrick.com/wiki/view/pageId/11/slug/the-sbrick-ble-protocol
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function() {
	'use strict';

	const ID_SBRICK                             = "SBrick";
	const FIRMWARE_COMPATIBILITY                = 4.17;

	const UUID_SERVICE_DEVICEINFORMATION        = "device_information";
	const UUID_CHARACTERISTIC_MODELNUMBER       = "model_number_string";
	const UUID_CHARACTERISTIC_FIRMWAREREVISION  = "firmware_revision_string";
	const UUID_CHARACTERISTIC_HARDWAREREVISION  = "hardware_revision_string";
	const UUID_CHARACTERISTIC_SOFTWAREREVISION  = "software_revision_string";
	const UUID_CHARACTERISTIC_MANUFACTURERNAME  = "manufacturer_name_string";

	const UUID_SERVICE_REMOTECONTROL            = "4dc591b0-857c-41de-b5f1-15abda665b0c";
	const UUID_CHARACTERISTIC_REMOTECONTROL     = "02b8cbcc-0e25-4bda-8790-a15f53e6010f";
	const UUID_CHARACTERISTIC_QUICKDRIVE        = "489a6ae0-c1ab-4c9c-bdb2-11d373c1b7fb";

	const UUID_SERVICE_OTA                      = "1d14d6ee-fd63-4fa1-bfa4-8f47b42119f0";
	const UUID_CHARACTERISTIC_OTACONTROL        = "f7bf3564-fb6d-4e53-88a4-5e37e0326063";

	// REMOTE CONTROL COMMANDS

	// Exceptions
	const ERROR_LENGTH  = 0x80; // Invalid command length
	const ERROR_PARAM   = 0x81; // Invalid parameter
	const ERROR_COMMAND = 0x82; // No such command
	const ERROR_NOAUTH  = 0x83; // No authentication needed
	const ERROR_AUTH    = 0x84; // Authentication error
	const ERROR_DOAUTH  = 0x85; // Authentication needed
	const ERROR_AUTHOR  = 0x86; // Authorization error
	const ERROR_THERMAL = 0x87; // Thermal protection is active
	const ERROR_STATE   = 0x88; // The system is in a state where the command does not make sense

	// Commands
	const CMD_BREAK      			= 0x00; // Stop command
	const CMD_DRIVE					= 0x01; // Drive command
	// const CMD_GET_CHANNEL_STATUS	= 0x22; // Get channel status command // not used yet
	const CMD_ADC        			= 0x0F; // Query ADC
	const CMD_ADC_VOLT   			= 0x08; // Get Voltage
	const CMD_ADC_TEMP   			= 0x09; // Get Temperature

	// Channels hex values to send with bluetooth commands
	const CHANNEL_0_HEX_ID = 0x00; // Top-Left Channel
	const CHANNEL_1_HEX_ID = 0x01; // Bottom-Left Channel
	const CHANNEL_2_HEX_ID = 0x02; // Top-Right Channel
	const CHANNEL_3_HEX_ID = 0x03; // Bottom-Right Channel
	// create array with hex ids, so we can always reference them with normal numbers
	const CHANNEL_HEX_IDS  = [	
								CHANNEL_0_HEX_ID,
								CHANNEL_1_HEX_ID,
								CHANNEL_2_HEX_ID,
								CHANNEL_3_HEX_ID
							];

	// Directions
	const CLOCKWISE        = 0x00; // Clockwise
	const COUNTERCLOCKWISE = 0x01; // Counterclockwise

	// Values limits
	const MIN    = 0;   // No Speed
	const MAX    = 255; // Max Speed
	const MAX_QD = 127; // Max Speed for QuickDrive
	const MAX_VOLT = 9; // Max Voltage = Full battery

	// Sbrick class definition
	class SBrick {

		constructor() {
			// export constants
			this.CHANNEL0   = CHANNEL_0_HEX_ID;
			this.CHANNEL1   = CHANNEL_1_HEX_ID;
			this.CHANNEL2   = CHANNEL_2_HEX_ID;
			this.CHANNEL3   = CHANNEL_3_HEX_ID;
			this.CW         = CLOCKWISE;
			this.CCW        = COUNTERCLOCKWISE;
			this.MAX        = MAX;
			this.SERVICES   = {}

			// status
    		this.keepalive = null;
			this.channels   = [
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false },
				{ power: MIN, direction: CLOCKWISE, busy: false }
			];

			// queue
			this.maxConcurrent = 1;
			this.maxQueue      = Infinity;
			this.queue         = new Queue( this.maxConcurrent, this.maxQueue );

			// debug
			this._debug         = false;
    	}

		connect( sbrick_name ) {
			this.SERVICES = {
				[UUID_SERVICE_DEVICEINFORMATION] : {
					name : "Device Information",
					characteristics : {
						[UUID_CHARACTERISTIC_MODELNUMBER] : {
							name : "Model Number String"
						},
						[UUID_CHARACTERISTIC_FIRMWAREREVISION] : {
							name : "Firmware Revision String"
						},
						[UUID_CHARACTERISTIC_HARDWAREREVISION] : {
							name : "Hardware Revision String"
						},
						[UUID_CHARACTERISTIC_SOFTWAREREVISION] : {
							name : "Software Revision String"
						},
						[UUID_CHARACTERISTIC_MANUFACTURERNAME] : {
							name : "Manufacturer Name String"
						}
					}
				},
				[UUID_SERVICE_REMOTECONTROL] : {
					name : "Remote Control",
					characteristics : {
						[UUID_CHARACTERISTIC_REMOTECONTROL] : {
							name : "Quick Drive"
						},
						[UUID_CHARACTERISTIC_QUICKDRIVE] : {
							name : "Remote Control"
						}
					}
				}
			}
			let options = {
				// filter by service should work but it doesn't show any SBrick...
				// filters: [{
				// 	services: [ UUID_SERVICE_DEVICEINFORMATION, UUID_SERVICE_OTA, UUID_SERVICE_REMOTECONTROL ]
				// }],
				optionalServices: Object.keys(this.SERVICES)
			};

			// if the SBrick name is not defined it shows all the devices
			// I don't like this solution, would be better to filter "by services"
			if( typeof sbrick_name !== 'undefined' ) {
				options.filters = [{
					namePrefix: [ sbrick_name ]
				}];
			} else {
				options.acceptAllDevices = true;
			}
			return WebBluetooth.connect(options,this.SERVICES)
			.then( () => {
				if( this.isConnected() ) {
					if( this._debug ) {
						this._log( "Connected to SBrick " + WebBluetooth.device.id );
					}
					// Firmware Compatibility Check
					this.getFirmwareVersion()
					.then( version => {
						if( parseFloat(version) >= FIRMWARE_COMPATIBILITY ) {
							this.keepalive = this._keepalive(this);
						} else {
							this._log("Firmware not compatible: please update your SBrick.");
							this.disconnect();
						}
					});
				}
			})
			.catch( e => { this._error(e) } );
	    }


		disconnect() {
			return new Promise( (resolve, reject) => {
					if( this.isConnected() ) {
						resolve();
					} else {
						reject('Not connected');
					}
			} ).then( ()=> {
				return this.stopAll().then( ()=>{
					clearInterval( this.keepalive );
					return WebBluetooth.disconnect();
				} );
			} )
			.catch( e => { this._error(e) } );
		}


		isConnected() {
			return WebBluetooth && WebBluetooth.isConnected();
		}

		_deviceInfo( uuid_characteristic ) {
			return new Promise( (resolve, reject) => {
				if( typeof this.SERVICES[UUID_SERVICE_DEVICEINFORMATION].characteristics[uuid_characteristic] != 'undefined' ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			} ).then( () => {
				return WebBluetooth.readCharacteristicValue( uuid_characteristic )
				.then(data => {
					var str = "";
					for (let i = 0; i < data.byteLength; i++) {
						str += String.fromCharCode(data.getUint8(i));
					}
					return str;
				})
				.catch( e => { this._error(e) } );
			})
			.catch( e => { this._error(e) } );
		}

		getModelNumber() {
			return this._deviceInfo(UUID_CHARACTERISTIC_MODELNUMBER).then( model => {
					return model;
			} )
		}

		getFirmwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_FIRMWAREREVISION).then( version => {
					return version;
			} )
		}

		getHardwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_HARDWAREREVISION).then( version => {
					return version;
			} )
		}

		getSoftwareVersion() {
			return this._deviceInfo(UUID_CHARACTERISTIC_SOFTWAREREVISION).then( version => {
					return version;
			} )
		}

		getManufacturerName() {
			return this._deviceInfo(UUID_CHARACTERISTIC_MANUFACTURERNAME).then( version => {
					return version;
			} )
		}


		/**
		* send drive command
		* @returns {promise}
		* @param {number} channelId The id (0-3) of the channel to update in the this.channels array
		* @param {hexadecimal number} direction The drive direction (0x00, 0x01 - you can use the constants SBrick.CLOCKWISE and SBrick.COUNTERCLOCKWISE)
		* @param {number} power The power level for the drive command 0-255
		*/
		drive( channelId, direction, power ) {
			return new Promise( (resolve, reject) => {
				if( channelId !== null && direction !== null && power !== null ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			} ).then( () => {
				let directions = [CLOCKWISE, COUNTERCLOCKWISE];
				let channel = this.channels[channelId];

				channel.power     = Math.min(Math.max(parseInt(Math.abs(power)), MIN), MAX);
				channel.direction = directions[direction];

				if( !channel.busy ) {
					channel.busy = true;
					this.queue.add( () => {
						channel.busy = false;
						return WebBluetooth.writeCharacteristicValue(
							UUID_CHARACTERISTIC_REMOTECONTROL,
							new Uint8Array([ CMD_DRIVE, CHANNEL_HEX_IDS[channelId], channel.direction, channel.power ])
						) }
					);
				}
			} )
			.catch( e => { this._error(e) } );
		}


		/**
		* send quickDrive command
		* @returns {undefined}
		* @param {array} channelSettings An array with a settings object {channelId, direction, power} for every channel you want to update
		* 	in every channel's object, the property channel (SBrick['CHANNEL'+channelId]) is supported for legacy reasons
		*/
		quickDrive(channelSettings) {
			return new Promise( (resolve, reject) => {
				if( channelSettings !== null && Array.isArray(channelSettings) ) {
					resolve();
				} else {
					reject('Wrong input');
				}
			} ).then( ()=> {

				channelSettings.forEach( (setting) => {
					let channelId = setting.channelId;
					if (setting.channel) {
						// it uses the old syntax
						channelId = parseInt( setting.channel );
					}
					let channel = this.channels[channelId];
					channel.power     = Math.min(Math.max(parseInt(Math.abs(setting.power)), MIN), MAX);
					channel.direction = setting.direction ? COUNTERCLOCKWISE : CLOCKWISE;
				})


				if(this._allChannelsAreIdle()) {
					this._setAllChannelsBusy();
					this.queue.add( () => {
						this._setAllChannelsIdle();

						return WebBluetooth.writeCharacteristicValue(
							UUID_CHARACTERISTIC_QUICKDRIVE,
							new Uint8Array([
								this._createQuickDriveUint8(0, this.channels),
								this._createQuickDriveUint8(1, this.channels),
								this._createQuickDriveUint8(2, this.channels),
								this._createQuickDriveUint8(3, this.channels)
							])
						) }
					);
				}
			})
			.catch( e => { this._error(e) } );
		}


		/**
		* stop a channel
		* @param {number | array} channelIds The number or array of numbers of channels to stop
		* @returns {promise}
		*/
		stop( channelIds ) {
			return new Promise( (resolve, reject) => {
				// TODO: better input checking: number | array
				if( channelIds !== null ) {
					resolve();
				} else {
					reject('wrong input');
				}
			} ).then( () => {

				if( !Array.isArray(channelIds) ) {
					channelIds = [ channelIds ];
				}

				// create the right input for the Uint8Array:
				// break command + hex ids from all passed in channels
				let uint8ArrayInput = [
					CMD_BREAK
				];
				channelIds.forEach( (channelId) => {
					// set motors power to 0 in the object
					this.channels[channelId].power = 0;
					// add this channel's hex id to be included in uint8Array
					uint8ArrayInput.push(CHANNEL_HEX_IDS[channelId]);
				});

				let command = new Uint8Array(uint8ArrayInput);

				this.queue.add( () => {
					return WebBluetooth.writeCharacteristicValue(
						UUID_CHARACTERISTIC_REMOTECONTROL,
						command
					);
				});

			} )
			.catch( e => { this._error(e) } );
		}


		/**
		* stop all channels
		* @returns {promise}
		*/
		stopAll() {
			return this.stop([0, 1, 2, 3]);
		}


		getBattery() {
			return this._volt()
			.then( volt => {
				return parseInt( Math.abs( volt / MAX_VOLT * 100 ) );
			});
		}


		getTemp( fahrenheit ) {
			return this._temp()
			.then( temp => {
				let result = 0;
				if( fahrenheit ) {
					result = temp * 9/5 + 32;
					result = result; // ' °F';
				} else {
					result = temp; // ' °C';
				}
				return result;
			});
		}


		_keepalive() {
			return setInterval( () => {
				if( !this.isConnected() ) {
					this._log('Connection lost');
					clearInterval( this.keepalive );
				} else if( this.queue.getQueueLength() === 0 ) {
					this.queue.add( () => {
						return WebBluetooth.writeCharacteristicValue(
							UUID_CHARACTERISTIC_REMOTECONTROL,
							new Uint8Array( [ CMD_ADC, CMD_ADC_TEMP ] )
						);
					} );
				}
			}, 300);
		}


		_adc( mode ) {
			return this.queue.add( () => {
				return WebBluetooth.writeCharacteristicValue(
					UUID_CHARACTERISTIC_REMOTECONTROL,
					new Uint8Array([CMD_ADC,mode])
				).then(() => {
					return WebBluetooth.readCharacteristicValue(UUID_CHARACTERISTIC_REMOTECONTROL)
					.then(data => {
						return data.getInt16( 0, true );
					});
				});
			});
		}


		_volt() {
			return this._adc(CMD_ADC_VOLT).then( volt => {
				return parseFloat( volt * 0.83875 / 2047.0 ); // V;
			} )
		}


		_temp() {
			return this._adc(CMD_ADC_TEMP).then( temp => {
				return parseFloat(temp / 118.85795 - 160); // °C;
			} )
		}

		_error( msg ) {
			if(this._debug) {
				console.debug(msg);
			} else {
				throw msg;
			}
		}

		_log( msg ) {
			if(this._debug) {
				console.log(msg);
			}
		}



		/**
		* create a Uint8 value with quick drive instructions
		* @returns {uint8 value}
		*/
		_createQuickDriveUint8(channelId, channels) {
			let channel = this.channels[channelId];
			return parseInt( parseInt(channel.power/MAX*MAX_QD).toString(2) + channel.direction, 2 );
		};
		

		/**
		* check if no channel is busy
		* @returns {boolean}
		*/
		_allChannelsAreIdle() {
			let allAreIdle = true;
			this.channels.forEach((channel) => {
				if (channel.busy) {
					allAreIdle = false;
				}
			});
			
			return allAreIdle;
		}


		/**
		* set all channels to busy
		* @returns {undefined}
		*/
		_setAllChannelsBusy() {
			this.channels.forEach((channel) => {
				channel.busy = true;
			});
		};


		/**
		* set all channels to idle
		* @returns {undefined}
		*/
		_setAllChannelsIdle() {
			this.channels.forEach((channel) => {
				channel.busy = false;
			});
		};
		

  }

  window.SBrick = new SBrick();

})();
