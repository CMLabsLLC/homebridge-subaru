import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { SubaruHomebridgePlatform } from './subaruHomebridgePlatform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SubaruPlatformLockAccessory {
  private service: Service;

  constructor(
    private readonly platform: SubaruHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    // set accessory information
    // TODO
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the LockMechanism service if it exists, otherwise create a new LockMechanism service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.exampleDisplayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the lockCurrentState/Off Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onSet(this.setLockCurrentState.bind(this)) // SET - bind to the `setLockCurrentState` method below
      .onGet(this.getLockCurrentState.bind(this)); // GET - bind to the `getLockCurrentState` method below
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setLockCurrentState(value: CharacteristicValue) {
    this.service.updateCharacteristic(this.platform.Characteristic.LockCurrentState, value);

    this.platform.log.debug('Set Characteristic lockCurrentState ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.lockCurrentState, true)
   */
  async getLockCurrentState(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const lockCurrentState = this.platform.Characteristic.LockCurrentState.UNKNOWN;

    this.platform.log.debug('Get Characteristic lockCurrentState ->', lockCurrentState);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return lockCurrentState;
  }
}
