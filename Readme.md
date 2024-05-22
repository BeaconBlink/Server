# Starting a server:

```bash
"npm run build:dev" #in one terminal
"npm run start:dev" #in another terminal
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