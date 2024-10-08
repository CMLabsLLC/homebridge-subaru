import { PlatformConfig } from 'homebridge';

export interface SubaruHomebridgePlatformConfig extends PlatformConfig {
    name?: string;
    username?: string;
    password?: string;
    lastSelectedVehicleKey?: string;
    deviceId?: string;
    pin?: string;
  }