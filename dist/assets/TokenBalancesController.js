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
const { BN } = require('ethereumjs-util');
exports.BN = BN;
/**
 * Controller that passively polls on a set interval token balances
 * for tokens stored in the AssetsController
 */
class TokenBalancesController extends BaseController_1.default {
    /**
     * Creates a TokenBalancesController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        /**
         * Name of this controller used during composition
         */
        this.name = 'TokenBalancesController';
        /**
         * List of required sibling controllers this controller needs to function
         */
        this.requiredControllers = ['AssetsContractController', 'AssetsController'];
        this.defaultConfig = {
            interval: 180000,
            tokens: []
        };
        this.defaultState = { contractBalances: {} };
        this.initialize();
        this.poll();
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval used to fetch new token balances
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateBalances());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Updates balances for all tokens
     *
     * @returns Promise resolving when this operation completes
     */
    updateBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.disabled) {
                return;
            }
            const assetsContract = this.context.AssetsContractController;
            const assets = this.context.AssetsController;
            const { selectedAddress } = assets.config;
            const { tokens } = this.config;
            const newContractBalances = {};
            for (const i in tokens) {
                const address = tokens[i].address;
                newContractBalances[address] = yield assetsContract.getBalanceOf(address, selectedAddress);
            }
            this.update({ contractBalances: newContractBalances });
        });
    }
    /**
     * Extension point called if and when this controller is composed
     * with other controllers using a ComposableController
     */
    onComposed() {
        super.onComposed();
        const assets = this.context.AssetsController;
        assets.subscribe(({ tokens }) => {
            this.configure({ tokens });
            this.updateBalances();
        });
    }
}
exports.TokenBalancesController = TokenBalancesController;
exports.default = TokenBalancesController;
//# sourceMappingURL=TokenBalancesController.js.map