"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_util_1 = require("ethereumjs-util");
const BaseController_1 = require("../BaseController");
/**
 * Controller that stores shared settings and exposes convenience methods
 */
class PreferencesController extends BaseController_1.default {
    /**
     * Creates a PreferencesController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        /**
         * Name of this controller used during composition
         */
        this.name = 'PreferencesController';
        this.defaultState = {
            featureFlags: {},
            frequentRpcList: [],
            identities: {},
            ipfsGateway: 'https://ipfs.io/ipfs/',
            lostIdentities: {},
            selectedAddress: ''
        };
        this.initialize();
    }
    /**
     * Adds identities to state
     *
     * @param addresses - List of addresses to use to generate new identities
     */
    addIdentities(addresses) {
        const { identities } = this.state;
        addresses.forEach((address) => {
            address = ethereumjs_util_1.toChecksumAddress(address);
            if (identities[address]) {
                return;
            }
            const identityCount = Object.keys(identities).length;
            identities[address] = { name: `Account ${identityCount + 1}`, address };
        });
        this.update({ identities: Object.assign({}, identities) });
    }
    /**
     * Removes an identity from state
     *
     * @param address - Address of the identity to remove
     */
    removeIdentity(address) {
        address = ethereumjs_util_1.toChecksumAddress(address);
        const { identities } = this.state;
        if (!identities[address]) {
            return;
        }
        delete identities[address];
        this.update({ identities: Object.assign({}, identities) });
        if (address === this.state.selectedAddress) {
            this.update({ selectedAddress: Object.keys(identities)[0] });
        }
    }
    /**
     * Associates a new label with an identity
     *
     * @param address - Address of the identity to associate
     * @param label - New label to assign
     */
    setAccountLabel(address, label) {
        address = ethereumjs_util_1.toChecksumAddress(address);
        const identities = this.state.identities;
        identities[address] = identities[address] || {};
        identities[address].name = label;
        this.update({ identities: Object.assign({}, identities) });
    }
    /**
     * Enable or disable a specific feature flag
     *
     * @param feature - Feature to toggle
     * @param activated - Value to assign
     */
    setFeatureFlag(feature, activated) {
        const oldFeatureFlags = this.state.featureFlags;
        const featureFlags = Object.assign(Object.assign({}, oldFeatureFlags), { [feature]: activated });
        this.update({ featureFlags: Object.assign({}, featureFlags) });
    }
    /**
     * Synchronizes the current identity list with new identities
     *
     * @param addresses - List of addresses corresponding to identities to sync
     * @returns - Newly-selected address after syncing
     */
    syncIdentities(addresses) {
        addresses = addresses.map((address) => ethereumjs_util_1.toChecksumAddress(address));
        const { identities, lostIdentities } = this.state;
        const newlyLost = {};
        for (const identity in identities) {
            if (addresses.indexOf(identity) === -1) {
                newlyLost[identity] = identities[identity];
                delete identities[identity];
            }
        }
        if (Object.keys(newlyLost).length > 0) {
            for (const key in newlyLost) {
                lostIdentities[key] = newlyLost[key];
            }
        }
        this.update({ identities: Object.assign({}, identities), lostIdentities: Object.assign({}, lostIdentities) });
        this.addIdentities(addresses);
        if (addresses.indexOf(this.state.selectedAddress) === -1) {
            this.update({ selectedAddress: addresses[0] });
        }
        return this.state.selectedAddress;
    }
    /**
     * Generates and stores a new list of stored identities based on address
     *
     * @param addresses - List of addresses to use as a basis for each identity
     */
    updateIdentities(addresses) {
        addresses = addresses.map((address) => ethereumjs_util_1.toChecksumAddress(address));
        const oldIdentities = this.state.identities;
        const identities = addresses.reduce((ids, address, index) => {
            ids[address] = Object.assign({ address, name: `Account ${index + 1}` }, (oldIdentities[address] || {}));
            return ids;
        }, {});
        this.update({ identities: Object.assign({}, identities) });
    }
    /**
     * Adds custom RPC URL to state
     *
     * @param url - Custom RPC URL
     * @param chainId? - Network ID as per EIP-155
     * @param ticker? - Currency ticker
     * @param nickname? - Personalized network name
     * @param rpcPrefs? - Personalized preferences
     *
     */
    addToFrequentRpcList(url, chainId, ticker, nickname, rpcPrefs) {
        const frequentRpcList = this.state.frequentRpcList;
        const index = frequentRpcList.findIndex(({ rpcUrl }) => {
            return rpcUrl === url;
        });
        if (index !== -1) {
            frequentRpcList.splice(index, 1);
        }
        const newFrequestRpc = { rpcUrl: url, chainId, ticker, nickname, rpcPrefs };
        frequentRpcList.push(newFrequestRpc);
        this.update({ frequentRpcList: [...frequentRpcList] });
    }
    /**
     * Removes custom RPC URL from state
     *
     * @param url - Custom RPC URL
     */
    removeFromFrequentRpcList(url) {
        const frequentRpcList = this.state.frequentRpcList;
        const index = frequentRpcList.findIndex(({ rpcUrl }) => {
            return rpcUrl === url;
        });
        if (index !== -1) {
            frequentRpcList.splice(index, 1);
        }
        this.update({ frequentRpcList: [...frequentRpcList] });
    }
    /**
     * Sets selected address
     *
     * @param selectedAddress - Ethereum address
     */
    setSelectedAddress(selectedAddress) {
        this.update({ selectedAddress: ethereumjs_util_1.toChecksumAddress(selectedAddress) });
    }
    /**
     * Sets new IPFS gateway
     *
     * @param ipfsGateway - IPFS gateway string
     */
    setIpfsGateway(ipfsGateway) {
        this.update({ ipfsGateway });
    }
}
exports.PreferencesController = PreferencesController;
exports.default = PreferencesController;
//# sourceMappingURL=PreferencesController.js.map