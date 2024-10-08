<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Homebridge Subaru Plugin

</span>

> [!NOTE]
> Many thanks to reddit user [arturg87](https://www.reddit.com/user/arturg87/) for their [post](https://www.reddit.com/r/shortcuts/comments/iu9eib/successfully_created_shortcut_for_subaru_starlink/) on siri shortcuts.


> [!IMPORTANT]
> This plugin requires an active starlink subscription.
>
> **Limits of the Subaru API**
>
> There is no way to determine the lock or unlocked status via the Subaru API.
> This plugin is currently set to default to "unlocked" when the status is unknown.
> This plugin does not sync with usage of key fob or starlink app.

> [!IMPORTANT]
> **Current Status of this Plugin**
>
> This plugin supports only one vehicle.
> This plugin supports only door lock/unlock as a single lock.
> This plugin will work while the vehicle is running.
> This plugin will work regardless of vehicle location.

---

The ideal use case of this plugin is to ensure the car is locked via a Goodnight Automation.

### Homebridge Configuration Fields

Field           	             | Description
-------------------------------|------------
**username**   	             | (required) Username for starlink account
**password**					             | (required) Password for starlink account
**lastSelectedVehicleKey**			             | (required) The ID of the vehicle to control
**deviceId**	             | (required) The ID of the device that is 2FA authenticated and saved to the starlink account
**pin**	             | (required) The pin number associated with the starlink account

These values can be found by inspecting the **login** form using browser debug tools on [mysubaru.com/](https://mysubaru.com/)
