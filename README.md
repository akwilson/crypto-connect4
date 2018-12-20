# Crypto Connect 4
```
$ npm install
$ npm start
```
Navigate to localhost:3000 and point MetaMask at Ropsten to start playing.

## Run on Ganache
Start Ganache and make a note of the seed phrase provided
```
$ ganache-cli
```
Deploy the smart contract
```
$ truffle compile
$ truffle migrate --network development
```
Copy the contract address to src/Config.js
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
Point MetaMask to localhost:8545 and import an account using the seed phrase supplied by Ganache at startup.
