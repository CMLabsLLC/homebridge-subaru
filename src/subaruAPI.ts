import axios from 'axios';
import { SubaruHomebridgePlatformConfig } from './subaruHomebridgePlatform';
import { Logging } from 'homebridge';
import qs from 'qs';
import child_process from 'child_process';

export class SubaruAPI {
  private readonly config: SubaruHomebridgePlatformConfig;
  public readonly log: Logging;
  private authCookies: string[];

  constructor(
    config: SubaruHomebridgePlatformConfig,
    log: Logging,
  ) {
    this.config = config;
    this.log = log;
    this.authCookies = [];

    // Add a request interceptor
    axios.interceptors.request.use((config) => {
      config.headers.Cookie = this.requestCookies();
      return config;
    }, (error) => {
      return Promise.reject(error);
    });
  }

  public async login() {
    const data: string = qs.stringify({
      'username': this.config.username || '',
      'password': this.config.password || '',
      'lastSelectedVehicleKey': this.config.lastSelectedVehicleKey || '',
      'deviceId': this.config.deviceId || '', 
    });

    const headers = await this.run_cmd(
      `/usr/bin/curl \
--silent \
--dump-header \
- \
-o /dev/null \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data '${data}' \
https://www.mysubaru.com/login`,
    );

    this.authCookies = this.processResponse(headers);
  }

  private processResponse(header: string): string[] {
    const cookies: string[] = [];
    header.split('\n').forEach ((line) => {
      if(line.startsWith('Set-Cookie')) {
        const cookie = line.replace('Set-Cookie: ', '').split(' ').at(0) || '';
        cookies.push(cookie);
      }
    });
    return cookies;
  }
  private async run_cmd(cmd: string): Promise<string> {
    return child_process.execSync(cmd, { encoding: 'utf8' });
  }

  private requestCookies() {
    const requestCookies: string[] = [];
    this.authCookies.forEach((cookie) => {
      const token = cookie.split(' ').at(0);
      if (token) {
        const trimmedToken = token.substring(0, token.length - 1);
        requestCookies.push(trimmedToken);
      }
    });
    return requestCookies.join('; ');
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  public async vehicleStatus() {
    await this.login();

    const data = qs.stringify({
      'pin': this.config.pin || '', 
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.mysubaru.com/service/g2/vehicleStatus/execute.json',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data : data,
    };

    const response = await axios.request(config);

    this.log('doorFrontLeftPosition: %s', response.data.data.result.doorFrontLeftPosition);
    this.log('doorFrontRightPosition: %s', response.data.data.result.doorFrontRightPosition);
    this.log('doorRearLeftPosition: %s', response.data.data.result.doorRearLeftPosition);
    this.log('doorRearRightPosition: %s', response.data.data.result.doorRearRightPosition);
 
    return response;
  }

  public async lock() {
    await this.login();

    const data = qs.stringify({
      'pin': this.config.pin || '',
      'now': this.seconds_since_epoch(),
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.mysubaru.com/service/g2/lock/execute.json',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data : data,
    };

    return await axios.request(config);
  }

  public async unlock() {
    const requestConfig = {
      data: {
        pin: `${this.config.pin}`,
        unlockDoorType: 'ALL_DOORS_CMD',
        now: `${this.seconds_since_epoch()}`,
      },
    };
    return await axios.post('https://www.mysubaru.com/service/g2/unlock/execute.json', requestConfig.data, { withCredentials: true });
  }

  seconds_since_epoch() {
    return Math.floor( Date.now() / 1000 );
  }
}
