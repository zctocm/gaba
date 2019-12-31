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
const ethereumjs_util_1 = require("ethereumjs-util");
const BaseController_1 = require("../BaseController");
const util_1 = require("../util");
/**
 * Controller that passively polls on a set interval for token-to-fiat exchange rates
 * for tokens stored in the AssetsController
 */
class TokenRatesController extends BaseController_1.default {
    /**
     * Creates a TokenRatesController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        this.tokenList = [];
        /**
         * Name of this controller used during composition
         */
        this.name = 'TokenRatesController';
        /**
         * List of required sibling controllers this controller needs to function
         */
        this.requiredControllers = ['AssetsController', 'CurrencyRateController'];
        this.defaultConfig = {
            disabled: true,
            interval: 180000,
            nativeCurrency: 'eth',
            tokens: []
        };
        this.defaultState = { contractExchangeRates: {} };
        this.initialize();
        this.configure({ disabled: false }, false, false);
        this.poll();
    }
    getPricingURL(query) {
        return `https://api.coingecko.com/api/v3/simple/token_price/ethereum?${query}`;
    }
    /**
     * Sets a new polling interval
     *
     * @param interval - Polling interval used to fetch new token rates
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateExchangeRates());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Sets a new token list to track prices
     *
     * @param tokens - List of tokens to track exchange rates for
     */
    set tokens(tokens) {
        this.tokenList = tokens;
        !this.disabled && util_1.safelyExecute(() => this.updateExchangeRates());
    }
    /**
     * Fetches a pairs of token address and native currency
     *
     * @param query - Query according to tokens in tokenList and native currency
     * @returns - Promise resolving to exchange rates for given pairs
     */
    fetchExchangeRate(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.handleFetch(this.getPricingURL(query));
        });
    }
    /**
     * Extension point called if and when this controller is composed
     * with other controllers using a ComposableController
     */
    onComposed() {
        super.onComposed();
        const assets = this.context.AssetsController;
        const currencyRate = this.context.CurrencyRateController;
        assets.subscribe(() => {
            this.configure({ tokens: assets.state.tokens });
        });
        currencyRate.subscribe(() => {
            this.configure({ nativeCurrency: currencyRate.state.nativeCurrency });
        });
    }
    /**
     * Updates exchange rates for all tokens
     *
     * @returns Promise resolving when this operation completes
     */
    updateExchangeRates() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tokenList.length === 0) {
                return;
            }
            const newContractExchangeRates = {};
            const { nativeCurrency } = this.config;
            const pairs = this.tokenList.map((token) => token.address).join(',');
            const query = `contract_addresses=${pairs}&vs_currencies=${nativeCurrency.toLowerCase()}`;
            const prices = yield this.fetchExchangeRate(query);
            this.tokenList.forEach((token) => {
                const address = ethereumjs_util_1.toChecksumAddress(token.address);
                const price = prices[token.address.toLowerCase()];
                newContractExchangeRates[address] = price ? price[nativeCurrency.toLowerCase()] : 0;
            });
            this.update({ contractExchangeRates: newContractExchangeRates });
        });
    }
}
exports.TokenRatesController = TokenRatesController;
exports.default = TokenRatesController;
//# sourceMappingURL=TokenRatesController.js.map