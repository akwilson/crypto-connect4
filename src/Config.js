const configData = {
    networks: {
        "1": {
            name: "Mainnet",
            c4ContractAddress: "0x0000",
            moveStakeEth: 0.01,
            etherscanURL: "https://etherscan.io/"
        },
        "3": {
            name: "Ropsten",
            c4ContractAddress: "0x87408bC4Df8A6FEf0d2779F1F056784e0F76c00d",
            moveStakeEth: 0.01,
            etherscanURL: "https://ropsten.etherscan.io/",
            eventWebSocketURL: "wss://ropsten.infura.io/ws"
        },
        "ganache": {
            name: "Ganache",
            c4ContractAddress: "0x6f1825bec099e062e65ede8f7494bbdc569d96cd",
            moveStakeEth: 0.01,
            eventWebSocketURL: "ws://localhost:8545"
        }
    },
    ownerCut: 0.1
}

class Config {
    setNetworkId(id) {
        if (id > 10000) {
            this.selectedNetworkId = "ganache"
        } else {
            this.selectedNetworkId = String(id)
        }
    }

    getOwnerCut() {
        return configData.ownerCut
    }

    getNetworkName() {
        return configData.networks[this.selectedNetworkId].name
    }

    getC4ContractAddress() {
        return configData.networks[this.selectedNetworkId].c4ContractAddress
    }

    getMoveStakeEth() {
        return configData.networks[this.selectedNetworkId].moveStakeEth
    }

    getEtherscnURL() {
        return configData.networks[this.selectedNetworkId].etherscanURL
    }

    getEventWebSocketURL() {
        return configData.networks[this.selectedNetworkId].eventWebSocketURL
    }
}

export default new Config()
