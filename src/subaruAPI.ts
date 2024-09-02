import axios, { AxiosHeaderValue, AxiosInstance } from 'axios';
import { SubaruHomebridgePlatformConfig } from './subaruHomebridgePlatform';
import { Logging } from 'homebridge';

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
    const response = await this.client.post(
      '/login',
      {
        username: this.config.username,
        password: this.config.password,
        lastSelectedVehicleKey: this.config.lastSelectedVehicleKey,
        deviceId: this.config.deviceId,
      },
    //   {
    //     withCredentials: true,
    //     headers: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //     },
    //   },
    );
    
    this.log('response', response.data);
    const cookie: string[] = response.headers['set-cookie'] || []; 
    this.cookie = cookie;
    this.log('cookie: %s', cookie);

    return response;
  }

  public async vehicleStatus() {
    await this.login();

    const response = await this.client
      .post(
        '/service/g2/vehicleStatus/execute.json',
        { pin: this.config.pin },
        { withCredentials: true,
          headers: {
            Cookie: this.cookie,
          },
        },
      );
    // const response = await this.client
    //   .post(
    //     , 
    //     {
    //       data: {
            
    //       },
    //       withCredentials: true,
    //       headers: {
    //         Cookie: this.cookie,
    //       },
    //     });

    this.log('response:', response.data);
    this.log('doorFrontLeftPosition: %s', response.data.doorFrontLeftPosition);
    this.log('doorFrontRightPosition: %s', response.data.doorFrontRightPosition);
    this.log('doorRearLeftPosition: %s', response.data.doorRearLeftPosition);
    this.log('doorRearRightPosition: %s', response.data.doorRearRightPosition);

    return response;
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
