# Crypto Connect 4
```
$ npm install
$ cd node_modules/
$ ln -s ../build/contracts/Connect4.js Connect4
$ cd ..
```
Start Ganache
```
$ ganache-cli
```
Deploy the smart contract
```
$ truffle compile
$ truffle migrate --network development
```
Copy the contract address to src/Connect4Web3.js
```
Running migration: 2_deploy_contracts.js
  Deploying Connect4...
  ... 0x0f58a01ff3e518d24de9867a37766e9568907d4114218f6bd6620fda2c7ad159
  Connect4: 0x6339da0d80fe011f8d0c3eff79d6e5ec68e0c419
```
Contract address is 0x6339da0d80fe011f8d0c3eff79d6e5ec68e0c419
```
$ npm start
```
Navigate to localhost:3000
