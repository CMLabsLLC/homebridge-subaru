import axios from 'axios';
import { SubaruHomebridgePlatformConfig } from './subaruHomebridgePlatform';
import { Logging } from 'homebridge';
import qs from 'qs';
import fs from 'fs';

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
      this.log('injecting cookies', this.requestCookies());
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

    const config = {
      method: 'post',
      url: 'https://www.mysubaru.com/login',
      data: data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    const response = await axios.request(config);
    
    // this.log('response', response.data);
    this.authCookies = (response.headers['set-cookie'] || []);
    this.log('authCookies: %s', this.authCookies);

    // this.log(response.data);
    fs.writeFileSync('/tmp/test-login.html', JSON.stringify(response.data));
    // throw new Error('bye');
    return response;
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
    const requestConfig = {
      data: {
        pin: `${this.config.pin}`,
        now: `${this.seconds_since_epoch()}`,
      },
    };

    // if ((await this.login()).status !== 200) {
    //   throw new Error('Response not successful');
    // }
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

    // if ((await this.login()).status !== 200) {
    //   throw new Error('Response not successful');
    // }
    return await axios.post('https://www.mysubaru.com/service/g2/unlock/execute.json', requestConfig.data, { withCredentials: true });
  }

  seconds_since_epoch() {
    return Math.floor( Date.now() / 1000 );
  }
}
