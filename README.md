# js-ttn-device-manager

## import_devices.js

This will parse CSV file given as first script param and import the data into TTN.
Import uses [http API](https://www.thethingsnetwork.org/docs/applications/manager/api.html).
Data MUST be compatible with [import.sample.csv](./data_samples/import.sample.csv) file structure.

```
APP=my_app_name KEY=ttn-account-v2.myown_key node import_devices.js ~/data.csv
```
