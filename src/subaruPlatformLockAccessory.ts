import type { CharacteristicValue, PlatformAccessory, Service } from 'homebridge';

import type { SubaruHomebridgePlatform } from './subaruHomebridgePlatform.js';
import { SubaruAPI } from './subaruAPI.js';
import pDebounce from 'p-debounce';
/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SubaruPlatformLockAccessory {
  private service: Service;
  private lockCurrentState?: CharacteristicValue;
  private lockTargetState?: CharacteristicValue;

  constructor(
    private readonly platform: SubaruHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly subaruAPI: SubaruAPI,
  ) {
    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'C&M Labs LLC')
      .setCharacteristic(this.platform.Characteristic.Model, 'homebridge-subaru');

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/LockMechanism

    // get the LockMechanism service if it exists, otherwise create a new LockMechanism service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.LockMechanism) || this.accessory.addService(this.platform.Service.LockMechanism);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // create handlers for required characteristics
    this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
      .onGet(this.handleLockCurrentStateGet.bind(this))
      .onSet(this.handleLockCurrentStateSet.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
      .onGet(this.handleLockTargetStateGet.bind(this))
      .onSet(this.handleLockTargetStateSet.bind(this));
  }

  /**
   * Handle requests to get the current value of the "Lock Current State" characteristic
   */
  handleLockCurrentStateGet() {
    this.platform.log.debug('Triggered GET LockCurrentState');

    // set this to a valid value for LockCurrentState
    const defaultValue = this.platform.Characteristic.LockCurrentState.UNSECURED;

    return this.lockCurrentState || defaultValue;
  }

  handleLockCurrentStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET LockCurrentState:', value);

    this.lockCurrentState = value;
  }

  /**
   * Handle requests to get the current value of the "Lock Target State" characteristic
   */
  handleLockTargetStateGet() {
    this.platform.log.debug('Triggered GET LockTargetState');

    // set this to a valid value for LockCurrentState
    const defaultValue = this.platform.Characteristic.LockTargetState.UNSECURED;

    return this.lockTargetState || defaultValue;
  }

  /**
   * Handle requests to set the "Lock Target State" characteristic
   */
  handleLockTargetStateSet(value: CharacteristicValue) {
    this.platform.log.debug('Triggered SET LockTargetState:', value);

    switch (value) {
    case this.platform.Characteristic.LockTargetState.SECURED: {
      pDebounce(this.platform.subaruAPI.lock, 200);
      this.platform.log.success('Device locked.');
      this.service.setCharacteristic(
        this.platform.Characteristic.LockCurrentState,
        this.platform.Characteristic.LockCurrentState.SECURED,
      );
      break;
    }
    case this.platform.Characteristic.LockTargetState.UNSECURED: {
      pDebounce(this.platform.subaruAPI.unlock, 200);
      this.platform.log.success('Device unlocked.');
      this.service.setCharacteristic(
        this.platform.Characteristic.LockCurrentState,
        this.platform.Characteristic.LockCurrentState.UNSECURED,
      );
      break;
    }
    default: {
      this.platform.log.error('Unknown value');
      this.service.setCharacteristic(
        this.platform.Characteristic.LockCurrentState,
        this.platform.Characteristic.LockCurrentState.UNKNOWN,
      );
      break;
    }
    }
  }
}