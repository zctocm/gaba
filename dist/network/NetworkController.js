"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = require("../BaseController");
const EthQuery = require('eth-query');
const Subprovider = require('web3-provider-engine/subproviders/provider.js');
const createInfuraProvider = require('eth-json-rpc-infura/src/createProvider');
const createMetamaskProvider = require('web3-provider-engine//zero.js');
const Mutex = require('await-semaphore').Mutex;
const LOCALHOST_RPC_URL = 'http://localhost:8545';
/**
 * Controller that creates and manages an Ethereum network provider
 */
class NetworkController extends BaseController_1.default {
    /**
     * Creates a NetworkController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        this.internalProviderConfig = {};
        this.mutex = new Mutex();
        /**
         * Name of this controller used during composition
         */
        this.name = 'NetworkController';
        this.defaultState = {
            network: 'loading',
            provider: { type: 'mainnet' }
        };
        this.initialize();
    }
    initializeProvider(type, rpcTarget, chainId, ticker, nickname) {
        switch (type) {
            case 'kovan':
            case 'mainnet':
                this.setupInfuraProvider(type);
                break;
            case 'rinkeby':
            case 'goerli':
            case 'ropsten':
                this.setupInfuraProvider(type);
                break;
            case 'localhost':
                this.setupStandardProvider(LOCALHOST_RPC_URL);
                break;
            case 'rpc':
                rpcTarget && this.setupStandardProvider(rpcTarget, chainId, ticker, nickname);
                break;
        }
    }
    refreshNetwork() {
        this.update({ network: 'loading' });
        const { rpcTarget, type, chainId, ticker } = this.state.provider;
        this.initializeProvider(type, rpcTarget, chainId, ticker);
        this.lookupNetwork();
    }
    registerProvider() {
        this.provider.on('error', this.verifyNetwork.bind(this));
        this.ethQuery = new EthQuery(this.provider);
    }
    setupInfuraProvider(type) {
        const infuraProvider = createInfuraProvider({ network: type });
        const infuraSubprovider = new Subprovider(infuraProvider);
        const config = Object.assign(Object.assign({}, this.internalProviderConfig), {
            dataSubprovider: infuraSubprovider,
            engineParams: {
                blockTrackerProvider: infuraProvider,
                pollingInterval: 12000
            }
        });
        this.updateProvider(createMetamaskProvider(config));
    }
    setupStandardProvider(rpcTarget, chainId, ticker, nickname) {
        const config = Object.assign(Object.assign({}, this.internalProviderConfig), {
            chainId,
            engineParams: { pollingInterval: 12000 },
            nickname,
            rpcUrl: rpcTarget,
            ticker
        });
        this.updateProvider(createMetamaskProvider(config));
    }
    updateProvider(provider) {
        this.safelyStopProvider(this.provider);
        this.provider = provider;
        this.registerProvider();
    }
    safelyStopProvider(provider) {
        setTimeout(() => {
            provider && provider.stop();
        }, 500);
    }
    verifyNetwork() {
        this.state.network === 'loading' && this.lookupNetwork();
    }
    /**
     * Sets a new configuration for web3-provider-engine
     *
     * @param providerConfig - web3-provider-engine configuration
     */
    set providerConfig(providerConfig) {
        this.internalProviderConfig = providerConfig;
        const { type, rpcTarget, chainId, ticker, nickname } = this.state.provider;
        this.initializeProvider(type, rpcTarget, chainId, ticker, nickname);
        this.registerProvider();
        this.lookupNetwork();
    }
    /**
     * Refreshes the current network code
     */
    lookupNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            /* istanbul ignore if */
            if (!this.ethQuery || !this.ethQuery.sendAsync) {
                return;
            }
            const releaseLock = yield this.mutex.acquire();
            this.ethQuery.sendAsync({ method: 'net_version' }, (error, network) => {
                this.update({ network: error ? /* istanbul ignore next*/ 'loading' : network });
                releaseLock();
            });
        });
    }
    /**
     * Convenience method to update provider network type settings
     *
     * @param type - Human readable network name
     */
    setProviderType(type) {
        const _a = this.state.provider, { rpcTarget, chainId, nickname } = _a, providerState = __rest(_a, ["rpcTarget", "chainId", "nickname"]);
        this.update({
            provider: Object.assign(Object.assign({}, providerState), { type, ticker: 'ETH' })
        });
        this.refreshNetwork();
    }
    /**
     * Convenience method to update provider RPC settings
     *
     * @param rpcTarget - RPC endpoint URL
     * @param chainId? - Network ID as per EIP-155
     * @param ticker? - Currency ticker
     * @param nickname? - Personalized network name
     */
    setRpcTarget(rpcTarget, chainId, ticker, nickname) {
        this.update({
            provider: Object.assign(Object.assign({}, this.state.provider), { type: 'rpc', ticker, rpcTarget, chainId, nickname })
        });
        this.refreshNetwork();
    }
}
exports.NetworkController = NetworkController;
exports.default = NetworkController;
//# sourceMappingURL=NetworkController.js.map