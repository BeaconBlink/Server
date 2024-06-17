# Starting a server:

# Starting a server:

### With docker
Make sure to change `docker-compose.yml.example` to `docker-compose.yml`.
<br>
Then execute the command:
```bash
docker-compose up
```

### Without docker
In one terminal:
```bash
npm run build
```

In another terminal:
```bash
npm run start
```

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