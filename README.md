# windowwatcher
Raspberry Pi module that calls a web hook when a window opens or closes

# How to use a Raspberry Pi with Apple Homekit, a Synology NAS, Homebridge, Nest, and a few plugins to solve a real-world problem.

Hardware:
* Raspberry Pi Zero
* Magnetic contact switch
* 200 ohm resistor
* Synology NAS
* Nest on-wall thermostat
* AppleTV

Software:
* Apple Home (built in to iOS)
* Synology Docker (built in to Synology DSM software)
* Homebridge SKP (“custom” package for Synology)

Node packages:
* onoff
* node-fetch
* homebridge-nest
* homebridge-http-webhooks

The code:
* ww.js (runs on Raspberry Pi)
* ww.service (manages ww.js service)

How it works:
Whenever the window sensor detects that the window has changed, either from closed to open, or open to closed, the Pi makes an outbound HTTP GET request to homebridge-http-webhooks, running on my Synology NAS in a Docker container, and exposing port 51828. The GET call passes the name of the window and the new state. In this case, the window’s ID is sensor1, and the sensor state is false, indicating that the sensor is open.
http://192.168.85.100:51828?accessoryId=sensor1&state=false
Then, the HTTP server for homebridge-http-webhooks updates homebridge to tell it that the accessory called sensor1 is now open. Through some magic that I still don’t quite understand, Apple’s HomeKit detects that the bridged device sensor1 has changed state. This happens very quickly, and the UI in the iOS Home app updates nearly instantly.

Automation in the iOS Home app watches for sensor1 (aka Master Bedroom Window) and runs the script “When the Master Bedroom Window Opens”. This causes the Nest Thermostat Eco Mode to be set to on. This command goes back to the homebridge application, which tells the homebridge-nest application to tell the Nest service to put my thermostat in eco mode.

When we close the window, the exact same happens, but in reverse. The window sensor changes state, sends an HTTP get to the homebridge servers, which magically alerts Apple HomeKit, which runs the automation, which sends a message back to homebridge, which updates the Nest service in the cloud.

Testing:
$ node ww.js

Service config:
$ sudo systemctl start ww
$ sudo systemctl enable ww
