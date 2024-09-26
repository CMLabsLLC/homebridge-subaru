import { Logging, AccessoryEventTypes, Categories, PlatformAccessory } from 'homebridge';

import type { SubaruHomebridgePlatform } from './subaruHomebridgePlatform.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SubaruPlatformLockAccessory {
  // private service: Service;
  // private currentKnownState: CharacteristicValue;

  constructor(
    private readonly platform: SubaruHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    public readonly log: Logging,
  ) {
    // here's a fake hardware device that we'll expose to HomeKit
    const FAKE_LOCK = {
      locked: false,
      lock: () => {
        console.log('Locking the lock!');
        FAKE_LOCK.locked = true;
      },
      unlock: () => {
        console.log('Unlocking the lock!');
        FAKE_LOCK.locked = false;
      },
      identify: () => {
        console.log('Identify the lock!');
      },
    };

    // Generate a consistent UUID for our Lock Accessory that will remain the same even when
    // restarting our server. We use the `uuid.generate` helper function to create a deterministic
    // UUID based on an arbitrary "namespace" and the word "lock".
    const lockUUID = this.platform.api.hap.uuid.generate('hap-nodejs:accessories:lock');

    // This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
    const lock = exports.accessory = new this.platform.api.platformAccessory('Lock', lockUUID);

    // Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
    // @ts-expect-error: Core/BridgeCore API
    lock.username = 'C1:5D:3A:EE:5E:FA';
    // @ts-expect-error: Core/BridgeCore API
    lock.pincode = '031-45-154';
    lock.category = Categories.DOOR_LOCK;

    // set some basic properties (these values are arbitrary and setting them is optional)
    // lock
    //   .getService(Service.AccessoryInformation)!
    //   .setCharacteristic(Characteristic.Manufacturer, 'Lock Manufacturer')
    //   .setCharacteristic(Characteristic.Model, 'Rev-2')
    //   .setCharacteristic(Characteristic.SerialNumber, 'MY-Serial-Number');

    // listen for the "identify" event for this Accessory
     
    lock.on(AccessoryEventTypes.IDENTIFY, () => {
      FAKE_LOCK.identify();
    });

    const lockService = new this.platform.Service.LockMechanism('Fake Lock');

    const Characteristic = this.platform.api.hap.Characteristic;;
  
    // Add the actual Door Lock Service and listen for change events from iOS.
    lockService.getCharacteristic(Characteristic.LockTargetState)
      .on(this.platform.api.hap.CharacteristicEventTypes.SET, (value, callback) => {

        if (value === Characteristic.LockTargetState.UNSECURED) {
          FAKE_LOCK.unlock();
          callback(); // Our fake Lock is synchronous - this value has been successfully set

          // now we want to set our lock's "actual state" to be unsecured so it shows as unlocked in iOS apps
          lockService.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.UNSECURED);
        } else if (value === Characteristic.LockTargetState.SECURED) {
          FAKE_LOCK.lock();
          callback(); // Our fake Lock is synchronous - this value has been successfully set

          // now we want to set our lock's "actual state" to be locked so it shows as open in iOS apps
          lockService.updateCharacteristic(Characteristic.LockCurrentState, Characteristic.LockCurrentState.SECURED);
        }
      });

    // We want to intercept requests for our current state so we can query the hardware itself instead of
    // allowing HAP-NodeJS to return the cached Characteristic.value.
    lockService.getCharacteristic(Characteristic.LockCurrentState)
      .on(this.platform.api.hap.CharacteristicEventTypes.GET, callback => {

        // this event is emitted when you ask Siri directly whether your lock is locked or not. you might query
        // the lock hardware itself to find this out, then call the callback. But if you take longer than a
        // few seconds to respond, Siri will give up.

        if (FAKE_LOCK.locked) {
          console.log('Are we locked? Yes.');
          callback(undefined, Characteristic.LockCurrentState.SECURED);
        } else {
          console.log('Are we locked? No.');
          callback(undefined, Characteristic.LockCurrentState.UNSECURED);
        }
      });

    lock.addService(lockService);

    // this.currentKnownState = this.handleLockCurrentStateGet();

    // // create a new Lock Mechanism service
    // this.service = new this.platform.Service.LockMechanism('SubaruCarLockMechanism', this.platform.serviceUUID());

    // // create handlers for required characteristics
    // this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState)
    //   .onGet(this.handleLockCurrentStateGet.bind(this));

    // this.service.getCharacteristic(this.platform.Characteristic.LockTargetState)
    //   .onGet(this.handleLockTargetStateGet.bind(this))
    //   .onSet(this.handleLockTargetStateSet.bind(this));
  }

  //   /**
  //   * Handle requests to get the current value of the "Lock Current State" characteristic
  //   */
  //   handleLockCurrentStateGet() {
  //     this.log.debug('Triggered GET LockCurrentState');

  //     // defaulting to unsecured until there is a way to pull from subaru api
  //     const currentValue = this.platform.Characteristic.LockCurrentState.UNSECURED;

  //     return currentValue;
  //   }


  //   /**
  //  * Handle requests to get the current value of the "Lock Target State" characteristic
  //  */
  //   handleLockTargetStateGet() {
  //     return this.currentKnownState;
  //   }

//   /**
//  * Handle requests to set the "Lock Target State" characteristic
//  */
//   handleLockTargetStateSet(value: CharacteristicValue) {
//     this.log.debug('Triggered SET LockTargetState:', value);
//     switch (value) {
//     case this.platform.Characteristic.LockTargetState.SECURED: {
//       this.platform.subaruAPI.lock();
//       this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(value);
//       this.currentKnownState = value;
//       break;
//     }
//     case this.platform.Characteristic.LockTargetState.UNSECURED: {
//       this.platform.subaruAPI.unlock();
//       this.service.getCharacteristic(this.platform.Characteristic.LockCurrentState).updateValue(value);
//       this.currentKnownState = value;
//       break;
//     }
//     default: {
//       this.log.error('Unknown value');
//       break;
//     }
//     }
//   }
}
