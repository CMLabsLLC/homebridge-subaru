import type { API, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, Service } from 'homebridge';

import { SubaruPlatformLockAccessory } from './subaruPlatformLockAccessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';
import { SubaruHomebridgePlatformConfig } from './SubaruHomebridgePlatformConfig.js';
import { SubaruAPI } from './subaruAPI.js';
import { Md5 } from 'ts-md5';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class SubaruHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service;
  public readonly Characteristic: typeof Characteristic;
  public readonly subaruAPI: SubaruAPI;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logging,
    public readonly config: SubaruHomebridgePlatformConfig,
    public readonly api: API,
  ) {
    this.Service = api.hap.Service;
    this.Characteristic = api.hap.Characteristic;

    if (!config.name) {
      this.log.error('Missing required config value: name');
    }

    if (!config.username) {
      this.log.error('Missing required config value: username');
    }

    if (!config.password) {
      this.log.error('Missing required config value: password');
    }

    if (!config.lastSelectedVehicleKey) {
      this.log.error('Missing required config value: lastSelectedVehicleKey');
    }

    if (!config.deviceId) {
      this.log.error('Missing required config value: deviceId');
    }

    if (!config.pin) {
      this.log.error('Missing required config value: pin');
    }

    this.subaruAPI = new SubaruAPI(this.config, this.log);

    this.log.debug('Finished initializing platform:', this.config.name);

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      // run the method to discover / register your devices as accessories
      this.discoverDevices();
    });
  }

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to set up event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    // add the restored accessory to the accessories cache, so we can track if it has already been registered
    this.accessories.push(accessory);
  }

  /**
   * This is an example method showing how to register discovered accessories.
   * Accessories must only be registered once, previously created accessories
   * must not be registered again to prevent "duplicate UUID" errors.
   */
  discoverDevices() {
    const uuid = this.serviceUUID();

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    const deviceName = this.config.name || '';

    const device = {
      name: deviceName,
      uuid: uuid,
    };

    if (existingAccessory) {
      this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

      this.api.updatePlatformAccessories([existingAccessory]);

      new SubaruPlatformLockAccessory(this, existingAccessory, this.subaruAPI);
    } else {
      this.log.info('Adding new accessory:', deviceName);

      const accessory = new this.api.platformAccessory(deviceName, uuid);

      accessory.context.device = device;

      new SubaruPlatformLockAccessory(this, accessory, this.subaruAPI);

      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  public serviceUUID() {
    const hash = Md5.hashStr(this.config.username || '' + this.config.deviceId || '' + this.config.lastSelectedVehicleKey || '');
    return this.api.hap.uuid.generate(hash);
  }
}