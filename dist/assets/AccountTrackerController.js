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
const EthjsQuery = require('ethjs-query');
/**
 * Controller that tracks information for all accounts in the current keychain
 */
class AccountTrackerController extends BaseController_1.default {
    /**
     * Creates an AccountTracker instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        /**
         * Name of this controller used during composition
         */
        this.name = 'AccountTrackerController';
        /**
         * List of required sibling controllers this controller needs to function
         */
        this.requiredControllers = ['PreferencesController'];
        /**
         * Refreshes all accounts in the current keychain
         */
        this.refresh = () => __awaiter(this, void 0, void 0, function* () {
            this.syncAccounts();
            const { accounts } = this.state;
            for (const address in accounts) {
                yield util_1.safelyExecute(() => __awaiter(this, void 0, void 0, function* () {
                    const balance = yield this.ethjsQuery.getBalance(address);
                    accounts[address] = { balance: util_1.BNToHex(balance) };
                    this.update({ accounts: Object.assign({}, accounts) });
                }));
            }
            /* tslint:disable-next-line */
        });
        this.defaultConfig = {
            interval: 10000
        };
        this.defaultState = { accounts: {} };
        this.initialize();
    }
    syncAccounts() {
        const { state: { identities } } = this.context.PreferencesController;
        const { accounts } = this.state;
        const addresses = Object.keys(identities);
        const existing = Object.keys(accounts);
        const newAddresses = addresses.filter((address) => existing.indexOf(address) === -1);
        const oldAddresses = existing.filter((address) => addresses.indexOf(address) === -1);
        newAddresses.forEach((address) => {
            accounts[address] = { balance: '0x0' };
        });
        oldAddresses.forEach((address) => {
            delete accounts[address];
        });
        this.update({ accounts: Object.assign({}, accounts) });
    }
    /**
     * Sets a new provider
     *
     * @param provider - Provider used to create a new underlying EthQuery instance
     */
    set provider(provider) {
        this.ethjsQuery = new EthjsQuery(provider);
    }
    /**
     * Extension point called if and when this controller is composed
     * with other controllers using a ComposableController
     */
    onComposed() {
        super.onComposed();
        const preferences = this.context.PreferencesController;
        preferences.subscribe(this.refresh);
        this.poll();
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval trigger a 'refresh'
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.refresh());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
}
exports.AccountTrackerController = AccountTrackerController;
exports.default = AccountTrackerController;
//# sourceMappingURL=AccountTrackerController.js.map