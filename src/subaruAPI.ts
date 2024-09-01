import axios from 'axios';
import { SubaruHomebridgePlatformConfig } from './subaruHomebridgePlatform';

export class SubaruAPI {
  private readonly config: SubaruHomebridgePlatformConfig;

  constructor(config: SubaruHomebridgePlatformConfig) {
    this.config = config;
  }

  public async login() {
    const requestConfig = {
      data: {
        username: `${this.config.username}`,
        password: `${this.config.password}`,
        lastSelectedVehicleKey: `${this.config.lastSelectedVehicleKey}`,
        deviceId: `${this.config.deviceId}`,
      },
    };

    return await axios.post('https://www.mysubaru.com/login', requestConfig.data, { withCredentials: true });
  }

  public async lock() {
    const requestConfig = {
      data: {
        pin: `${this.config.pin}`,
        now: `${this.seconds_since_epoch()}`,
      },
    };

    if ((await this.login()).status !== 200) {
      throw new Error('Response not successful');
    }
    return await axios.post('https://www.mysubaru.com/service/g2/lock/execute.json', requestConfig.data, { withCredentials: true });
  }

  public async unlock() {
    const requestConfig = {
      data: {
        pin: `${this.config.pin}`,
        unlockDoorType: 'ALL_DOORS_CMD',
        now: `${this.seconds_since_epoch()}`,
      },
    };

    if ((await this.login()).status !== 200) {
      throw new Error('Response not successful');
    }
    return await axios.post('https://www.mysubaru.com/service/g2/unlock/execute.json', requestConfig.data, { withCredentials: true });
  }

  seconds_since_epoch() {
    return Math.floor( Date.now() / 1000 );
  }
}
