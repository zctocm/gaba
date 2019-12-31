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
Object.defineProperty(exports, "__esModule", { value: true });
const BaseController_1 = require("../BaseController");
const util_1 = require("../util");
const DOWN_NETWORK_STATUS = {
    kovan: 'down',
    mainnet: 'down',
    rinkeby: 'down',
    ropsten: 'down'
};
/**
 * Controller that passively polls on a set interval for network status of providers
 */
class NetworkStatusController extends BaseController_1.default {
    /**
     * Creates a NetworkStatusController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        /**
         * Name of this controller used during composition
         */
        this.name = 'NetworkStatusController';
        this.defaultConfig = { interval: 180000 };
        this.defaultState = {
            networkStatus: {
                infura: DOWN_NETWORK_STATUS
            }
        };
        this.initialize();
        this.poll();
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval used to fetch network status
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateNetworkStatuses());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Fetches infura network status
     *
     * @returns - Promise resolving to an infura network status object
     */
    updateInfuraStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const json = yield util_1.handleFetch('https://api.infura.io/v1/status/metamask');
                return json && json.mainnet ? json : /* istanbul ignore next */ DOWN_NETWORK_STATUS;
            }
            catch (error) {
                /* istanbul ignore next */
                return DOWN_NETWORK_STATUS;
            }
        });
    }
    /**
     * Updates network status for all providers
     *
     * @returns - Promise resolving when this operation completes
     */
    updateNetworkStatuses() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.disabled) {
                return;
            }
            const infura = yield this.updateInfuraStatus();
            this.update({ networkStatus: { infura } });
        });
    }
}
exports.NetworkStatusController = NetworkStatusController;
exports.default = NetworkStatusController;
//# sourceMappingURL=NetworkStatusController.js.map