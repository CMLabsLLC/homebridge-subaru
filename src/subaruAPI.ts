import axios, { AxiosHeaderValue, AxiosInstance } from 'axios';
import { SubaruHomebridgePlatformConfig } from './subaruHomebridgePlatform';
import { Logging } from 'homebridge';
import qs from 'qs';

export class SubaruAPI {
  private readonly config: SubaruHomebridgePlatformConfig;
  public readonly log: Logging;
  private readonly client: AxiosInstance;
  private cookie: AxiosHeaderValue;

  constructor(
    config: SubaruHomebridgePlatformConfig,
    log: Logging,
  ) {
    this.config = config;
    this.log = log;
    this.cookie = null;

    this.client = axios.create({
      baseURL: 'https://www.mysubaru.com',
    });
  }

  public async login() {
    const data = qs.stringify({
      'username': this.config.username,
      'password': this.config.password,
      'lastSelectedVehicleKey': this.config.lastSelectedVehicleKey,
      'deviceId': this.config.deviceId, 
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.mysubaru.com/login',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
      },
      data : data,
    };

    const response = await axios.request(config);

    // const response = await this.client.post(
    //   '/login',
    //   {
    //     username: this.config.username,
    //     password: this.config.password,
    //     lastSelectedVehicleKey: this.config.lastSelectedVehicleKey,
    //     deviceId: this.config.deviceId,
    //   },
    // //   {
    // //     withCredentials: true,
    // //     headers: {
    // //       'Content-Type': 'application/x-www-form-urlencoded',
    // //     },
    // //   },
    // );
    
    // this.log('response', response.data);
    const cookie: string[] = response.headers['set-cookie'] || []; 
    this.cookie = cookie;
    this.log('cookie: %s', cookie);

    return response;
  }

  public async vehicleStatus() {
    await this.login();

    const data = qs.stringify({
      'pin': this.config.pin, 
    });
      
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: 'https://www.mysubaru.com/service/g2/vehicleStatus/execute.json',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded', 
        // eslint-disable-next-line max-len
        'Cookie': 'JSESSIONID=2B87C009882C90AE83A748C7304BFED9; X-Oracle-BMC-LBS-Route=9b56b3d167d9dadbe8e8f7e6511957f32f5fa55a27da03a11a2ff120e313e9b656c62fd8a7c42ae820ddea14d24acf4566223adc497ec6096097d9c7',
      },
      data : data,
    };
  
    const response = await axios.request(config);

    this.log('response:', response.data);
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
