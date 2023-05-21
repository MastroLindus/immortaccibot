# immortaccibot

## Telegram bot

Install locally with
```
npm install
```
Visual studio code is suggested as there's configuration for its extensions.

For running locally run:
```
npm run offline
```
And send requests like:
```
./offline-invoke /echo test
./offline-invoke /dotaWl gino
```
Gino is a real user :P

For running tests use 
```
npm test
``` 
or use the visual code japa extension

Todo:

-   better logging
-   better mocking/patching global objects
-   move quotes to dynamo
-   use node telegram SDK library instead of making manual http calls
-   tweak github actions if we need to go with pull requests
-   new features!
