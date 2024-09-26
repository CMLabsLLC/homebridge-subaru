import { CharacteristicValue, PlatformAccessory, Service, Logging } from 'homebridge';

import type { SubaruHomebridgePlatform } from './subaruHomebridgePlatform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SubaruPlatformLockAccessory {
  private service: Service;
  private currentKnownState: CharacteristicValue;

  constructor(
    private readonly platform: SubaruHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    public readonly log: Logging,
  ) {
    this.currentKnownState = this.handleLockCurrentStateGet();

    // create a new Lock Mechanism service
    this.service = new this.platform.Service.LockMechanism('SubaruCarLockMechanism', this.platform.serviceUUID());

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

    // defaulting to unsecured until there is a way to pull from subaru api
    const currentValue = this.platform.Characteristic.LockCurrentState.UNSECURED;

    return currentValue;
  }


  /**
 * Handle requests to get the current value of the "Lock Target State" characteristic
 */
  handleLockTargetStateGet() {
    return this.currentKnownState;
  }

  /**
 * Handle requests to set the "Lock Target State" characteristic
 */
  handleLockTargetStateSet(value: CharacteristicValue) {
    this.log.debug('Triggered SET LockTargetState:', value);
    switch (value) {
    case this.platform.Characteristic.LockTargetState.SECURED: {
      this.platform.subaruAPI.lock();
      this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(value);
      this.currentKnownState = value;
      break;
    }
    case this.platform.Characteristic.LockTargetState.UNSECURED: {
      this.platform.subaruAPI.unlock();
      this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(value);
      this.currentKnownState = value;
      break;
    }
    default: {
      this.log.error('Unknown value');
      break;
    }
    }
  }
}
