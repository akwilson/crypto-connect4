const Connect4 = artifacts.require("./Connect4.sol")

module.exports = function(deployer) {
    deployer.deploy(Connect4, 7, 6, 4, 30, 1);
};
