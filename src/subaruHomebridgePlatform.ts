import { API, Categories, Characteristic, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig, Service } from 'homebridge';
import { SubaruAPI } from './subaruAPI.js';
import { Md5 } from 'ts-md5';
import { SubaruPlatformLockAccessory } from './subaruPlatformLockAccessory.js';
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js';

export interface SubaruHomebridgePlatformConfig extends PlatformConfig {
  username?: string;
  password?: string;
  lastSelectedVehicleKey?: string;
  deviceId?: string;
  pin?: string;
}

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

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');
      this.discoverDevices();
      this.subaruAPI.vehicleStatus();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  public serviceUUID() {
    const hash = Md5.hashStr(this.config.username || '' + this.config.deviceId || '' + this.config.lastSelectedVehicleKey || '');
    return this.api.hap.uuid.generate(hash);
  }

  async discoverDevices() {
    const uuid = this.serviceUUID();

    // const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

    // if (existingAccessory) {
    //   this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);

    //   this.api.updatePlatformAccessories([existingAccessory]);

    //   new SubaruPlatformLockAccessory(this, existingAccessory, this.log);
    // } else {
    this.log.info('Adding new accessory:', 'Car Lock');

    const accessory = new this.api.platformAccessory('Car Lock', uuid, Categories.DOOR_LOCK);

    new SubaruPlatformLockAccessory(this, accessory, this.log);

    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    // }
  }
}
