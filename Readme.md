# Starting a server:

### With docker
Make sure to change `docker-compose.yml.example` to `docker-compose.yml`.
<br>
Then execute the command:
```bash
docker-compose up
```

### Without docker
First build with npm:
```bash
npm run build
```

Then start the server:
```bash
npm run start
```
# Database schema:

## Rooms:
- `name` : The name of the room.
- `calibration` : Whether the room is calibrated or not.
- `last_calibration` : The last time the room was calibrated.
- `tags` : The tags of the room.
- `scan_results` : The scan results of the room.

## Devices:
- `mac_address` : The MAC address of the device.
- `alias` : The alias of the device.
- `last_connected` : The last time the device connected.
- `room` : The room in which the device is located.
- `calibration_mode` : The calibration status of the device.
- `battery_level` : The battery level of the device.

# Endpoints:

## GET "/"
This endpoint serves the main page for the client.

## POST "/ping"
This endpoint is used to send information to the server.

### Arguments:
- `mac_address`: The MAC address of the device.
- `scan_results`: An array of network information objects. Each object contains the following properties:
    - `ssid`: The SSID of the network.
    - `rssi`: The signal strength of the network in dBm.
    - `bssid`: The BSSID of the network.


## POST "/message"
This endpoint is used to send a message to the server, that saves message for a given device to be sent.

### Arguments:
- `mac_address`: The MAC address of the device.
- `message`: The message to be sent.

## GET "/devices":
This endpoint returns a list of all devices that have communicated with the server.

## POST "/calibration"
This endpoint is used to manage the calibration of a device.

### Arguments:
- `mac_address`: The MAC address of the device.
- `calibration`: The calibration value to be set (TRUE or FALSE)
- `room`: The room in which the device is located.

## POST "/location"
This endpoint is used to manage the location mode of the app.

### Arguments:
- `flag` : The location mode to be set (TRUE or FALSE)