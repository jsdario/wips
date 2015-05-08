# wips

Our antennas carry inside an Atheros [<a href="http://www.wifi-shop24.com/TP-Link-TL-WN725N-24-GHz-WiFi-USB-Adapter-Nano-150-Mbps">More</a>] chipset, then we can estimate better the power/percentage relation we get from `iwconfig` command.

Then we calculate the distance out of `RSSI` (Receive Signal Strength Indicator) thanks to this <a href="http://electronics.stackexchange.com/questions/83354/calculate-distance-from-rssi">formulae</a> and this <a href="http://www.ijitee.org/attachments/File/v2i2/A0359112112.pdf">paper</a>.

RSSI[dBm] = -10 * n * Math.log(d) + A[dBm]

Where A is the received signal strength in dBm at 1 metre.