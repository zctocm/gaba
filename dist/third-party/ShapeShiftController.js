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
/**
 * Controller that passively polls on a set interval for ShapeShift transactions
 */
class ShapeShiftController extends BaseController_1.default {
    /**
     * Creates a ShapeShiftController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        /**
         * Name of this controller used during composition
         */
        this.name = 'ShapeShiftController';
        this.defaultConfig = { interval: 3000 };
        this.defaultState = { shapeShiftTxList: [] };
        this.initialize();
        this.poll();
    }
    getPendingTransactions() {
        return this.state.shapeShiftTxList.filter((tx) => !tx.response || tx.response.status !== 'complete');
    }
    getUpdateURL(transaction) {
        return `https://shapeshift.io/txStat/${transaction.depositAddress}`;
    }
    updateTransaction(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            return util_1.safelyExecute(() => __awaiter(this, void 0, void 0, function* () {
                transaction.response = yield util_1.handleFetch(this.getUpdateURL(transaction));
                if (transaction.response && transaction.response.status === 'complete') {
                    transaction.time = Date.now();
                }
                return transaction;
            }));
        });
    }
    /**
     * Starts a new polling interval
     *
     * @param interval - Polling interval used to fetch new ShapeShift transactions
     */
    poll(interval) {
        return __awaiter(this, void 0, void 0, function* () {
            interval && this.configure({ interval }, false, false);
            this.handle && clearTimeout(this.handle);
            yield util_1.safelyExecute(() => this.updateTransactionList());
            this.handle = setTimeout(() => {
                this.poll(this.config.interval);
            }, this.config.interval);
        });
    }
    /**
     * Creates a new ShapeShift transaction
     *
     * @param depositAddress - Address where coins should be deposited
     * @param depositType - Abbreviation of the type of crypto currency to be deposited
     */
    createTransaction(depositAddress, depositType) {
        const { shapeShiftTxList } = this.state;
        const transaction = {
            depositAddress,
            depositType,
            key: 'shapeshift',
            response: undefined,
            time: Date.now()
        };
        shapeShiftTxList.push(transaction);
        this.update({ shapeShiftTxList: [...shapeShiftTxList] });
    }
    /**
     * Updates list of ShapeShift transactions
     *
     * @returns - Promise resolving when this operation completes
     */
    updateTransactionList() {
        return __awaiter(this, void 0, void 0, function* () {
            const { shapeShiftTxList } = this.state;
            const pendingTx = this.getPendingTransactions();
            if (this.disabled || pendingTx.length === 0) {
                return;
            }
            yield Promise.all(pendingTx.map((tx) => this.updateTransaction(tx)));
            this.update({ shapeShiftTxList: [...shapeShiftTxList] });
        });
    }
}
exports.ShapeShiftController = ShapeShiftController;
exports.default = ShapeShiftController;
//# sourceMappingURL=ShapeShiftController.js.map