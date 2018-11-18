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
            c4ContractAddress: "0x70f4f8fb7e0142f7736c8d1b0dba187fe9c84559",
            moveStakeEth: 0.01,
            etherscanURL: "https://ropsten.etherscan.io/"
        },
        "ganache": {
            name: "Ganache",
            c4ContractAddress: "0x84c51fc572d6fedf28662d8e5cec63dfc2323f48",
            moveStakeEth: 0.01
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
}

export default new Config()
