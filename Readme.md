# Main server
Main server of the BeaconBlink system.<br>
This server is responsible for data flow between all other components of the system, as well as the database.
It also serves the web application, which is the main interface for users.

## Tech Stack:

### Backend:
- Node.js
- Express
- TypeScript
- FetchAPI

### Frontend:
- TypeScript
- React
- TailwindCSS
- React Select
- React Router
- Axios
- FetchAPI
- React-icons

## Starting the server:

### It is not recommended to run the server alone. Be sure to run the whole [Deployment](https://github.com/BeaconBlink/Deployment).

### Run with docker
Make sure to change `docker-compose.yml.example` to `docker-compose.yml`.
<br>
Then execute the command:
```bash
  docker-compose up
```

### Run without docker
First build with npm:
```bash
  npm run build
```

Then start the server:
```bash
  npm run start
```

# Server Endpoints

## Available Endpoints

### `GET "/"`

Provides the main page of the application. All routing is done on the client side using React Router.
#### Response:
- `index.html` file.

### `POST "/test_ping"`

Allows for identifying a device by displaying its MAC address on its screen and emitting a sound signal.

#### Arguments:
- `mac_address`: **string** - MAC address of the device to be identified.

### `POST "/message"`

Responsible for creating a task that displays the sent message and adds it to the queues of specified devices.

#### Arguments:
- `mac_address[]`: **string[]** - MAC addresses of devices on which the message is to be displayed.
- `message`: **string** - Content of the message.

### `POST "/calibration"`

Allows switching the calibration mode for individual devices, indicating the room being calibrated. If a device previously calibrated a room that is now not on the list, it will disable the calibration mode for that room. After each completed calibration, an appropriate request is also sent to the machine learning module informing about the need for additional training due to new data.

#### Arguments:
- `devices[]`: **string[]** - MAC addresses of devices that are to calibrate the given room.
- `roomId`: **string** - ID of the room to be calibrated.

### `POST "/ping"`

This endpoint forms the basis of communication between Beacons and the server. Upon receiving a signal, the last login time of the device in the system is updated. If the Beacon is not in the database - it is added. Then, if the device is in calibration mode, the received network scan goes to the database, to the `scan_results` field for the calibrated room. If not - the network scan is sent to the machine learning module, which returns the predicted location of the device in a response message. As a response, this endpoint returns a list of commands to be executed by the device. The list will always contain a command to display a message containing the current location or the room currently being calibrated (in the case of calibration mode). Additionally, if there are pending messages for this device in the database, a command displaying the oldest pending message is added to the list, along with a command to emit a sound signal.

#### Arguments:
- `mac_address`: **string** - MAC address of the Beacon connecting to the server.
- `scan_results`: **NetworkInfo[]** - Information about networks scanned by the Beacon.

#### Response:
- Object of class **ServerResponse**.

### `GET "/rooms"`

Returns information about all rooms saved in the database.

#### Response:
- Array of objects **Room[]**.

### `GET "/rooms/:id"`

Returns information from the database about the room with the specified ID.

#### Parameters:
- `id`: **string** - Room identifier.

#### Response:
- Object of class **Room**.

### `GET "/rooms/tags"`

Returns information about all tags assigned to rooms.

#### Response:
- Array of strings **string[]**.

### `POST "/rooms"`

Adds a new room to the database.

#### Arguments:
- `newRoom`: **Room** - New room.

### `PUT "/rooms/:id"`

Updates the room with the given identifier.

#### Parameters:
- `id`: **string** - Room identifier.

#### Arguments:
- `updatedRoom`: **Room** - Updated room.

### `DELETE "/rooms/:id"`

Removes the room with the given identifier from the database. Additionally, it sends information to the machine learning module about the need to retrain the model due to changes in the system.

#### Parameters:
- `id`: **string** - Room identifier.

### `GET "/devices"`

Returns information about all devices saved in the database.

#### Response:
- Array of objects **Device[]**.

### `GET "/devices/:mac_address"`

Returns information from the database about the device with the specified MAC address.

#### Parameters:
- `mac_address`: **string** - MAC address of the device.

#### Response:
- Object of class **Device**.

### `POST "/devices"`

Adds a new device to the database.

#### Arguments:
- `newDevice`: **Device** - New device.

### `POST "/devices/located"`

Returns information about all devices located in the room with the given identifier.

#### Arguments:
- `roomId`: **string** - Room identifier.

#### Response:
- Array of objects **Device[]**.

### `POST "/devices/calibrating"`

Returns information about all devices that are calibrating the room with the given identifier.

#### Arguments:
- `roomId`: **string** - Room identifier.

#### Response:
- Array of objects **Device[]**.

### `PUT "/devices/:mac_address"`

Updates the device with the given MAC address.

#### Parameters:
- `mac_address`: **string** - MAC address of the device.

#### Arguments:
- `updatedDevice`: **Device** - Updated device.

### `DELETE "/device/:mac_address"`

Removes the device with the specified MAC address from the database.

#### Parameters:
- `mac_address`: **string** - MAC address of the device.