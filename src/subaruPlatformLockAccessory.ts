import type { CharacteristicValue, PlatformAccessory, Service, Logging } from 'homebridge';

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
    public readonly log: Logging,
  ) {
    // set accessory information
    // TODO
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // create a new Lock Mechanism service
    this.service = new this.platform.Service('Default-LockMechanism', '');

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));
  }

  /**
 * Handle requests to get the current value of the "Lock Current State" characteristic
 */
  handleLockCurrentStateGet() {
    this.log.debug('Triggered GET LockCurrentState');

    // set this to a valid value for LockCurrentState
    const currentValue = this.platform.Characteristic.LockCurrentState.UNSECURED;

    return currentValue;
  }


  /**
 * Handle requests to get the current value of the "Lock Target State" characteristic
 */
  handleLockTargetStateGet() {
    this.log.debug('Triggered GET LockTargetState');

    // set this to a valid value for LockTargetState
    const currentValue = this.platform.Characteristic.LockTargetState.UNSECURED;

    return currentValue;
  }

  /**
 * Handle requests to set the "Lock Target State" characteristic
 */
  handleLockTargetStateSet(value: CharacteristicValue) {
    this.log.debug('Triggered SET LockTargetState:', value);
  }
}
