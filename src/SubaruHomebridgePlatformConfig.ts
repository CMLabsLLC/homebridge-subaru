import { PlatformConfig } from 'homebridge';

export interface SubaruHomebridgePlatformConfig extends PlatformConfig {
    username?: string;
    password?: string;
    lastSelectedVehicleKey?: string;
    deviceId?: string;
    pin?: string;
  }