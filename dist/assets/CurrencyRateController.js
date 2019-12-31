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
const Mutex = require('await-semaphore').Mutex;
const BaseController_1 = require("../BaseController");
const util_1 = require("../util");
/**
 * Controller that passively polls on a set interval for an exchange rate from the current base
 * asset to the current currency
 */
class CurrencyRateController extends BaseController_1.default {
    /**
     * Creates a CurrencyRateController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        this.activeCurrency = '';
        this.activeNativeCurrency = '';
        this.mutex = new Mutex();
        /**
         * Name of this controller used during composition
         */
        this.name = 'CurrencyRateController';
        this.defaultConfig = {
            currentCurrency: this.getCurrentCurrencyFromState(state),
            disabled: true,
            interval: 180000,
            nativeCurrency: 'CFX'
        };
        this.defaultState = {
            conversionDate: 0,
            conversionRate: 0,
            currentCurrency: this.defaultConfig.currentCurrency,
            nativeCurrency: this.defaultConfig.nativeCurrency
        };
        this.initialize();
        this.configure({ disabled: false }, false, false);
        this.poll();
    }
    getCurrentCurrencyFromState(state) {
        return (state && state.currentCurrency) ? state.currentCurrency : 'usd';
    }
    getPricingURL(currentCurrency, nativeCurrency) {
        return (`https://min-api.cryptocompare.com/data/price?fsym=` +
            `${nativeCurrency.toUpperCase()}&tsyms=${currentCurrency.toUpperCase()}`);
    }
    /**
     * Sets a currency to track
     *
     * @param currentCurrency - ISO 4217 currency code
     */
    set currentCurrency(currentCurrency) {
        this.activeCurrency = currentCurrency;
        util_1.safelyExecute(() => this.updateExchangeRate());
    }
    /**
     * Sets a new native currency
     *
     * @param symbol - Symbol for the base asset
     */
    set nativeCurrency(symbol) {
        this.activeNativeCurrency = symbol;
        util_1.safelyExecute(() => this.updateExchangeRate());
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval used to fetch new exchange rate
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateExchangeRate());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Fetches the exchange rate for a given currency
     *
     * @param currency - ISO 4217 currency code
     * @param nativeCurrency - Symbol for base asset
     * @returns - Promise resolving to exchange rate for given currency
     */
    fetchExchangeRate(currency, nativeCurrency = this.activeNativeCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield util_1.handleFetch(this.getPricingURL(currency, nativeCurrency));
            return {
                conversionDate: Date.now() / 1000,
                conversionRate: Number(json[currency.toUpperCase()]),
                currentCurrency: currency,
                nativeCurrency
            };
        });
    }
    /**
     * Updates exchange rate for the current currency
     *
     * @returns Promise resolving to currency data or undefined if disabled
     */
    updateExchangeRate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.disabled || !this.activeCurrency || !this.activeNativeCurrency) {
                return;
            }
            const releaseLock = yield this.mutex.acquire();
            const { conversionDate, conversionRate } = yield this.fetchExchangeRate(this.activeCurrency, this.activeNativeCurrency);
            this.update({
                conversionDate,
                conversionRate,
                currentCurrency: this.activeCurrency,
                nativeCurrency: this.activeNativeCurrency
            });
            releaseLock();
            return this.state;
        });
    }
}
exports.CurrencyRateController = CurrencyRateController;
exports.default = CurrencyRateController;
//# sourceMappingURL=CurrencyRateController.js.map