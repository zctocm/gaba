import BaseController, { BaseConfig, BaseState } from '../BaseController';
/**
 * @type ShapeShiftTransaction
 *
 * ShapeShift transaction object
 *
 * @property depositAddress - Address where coins should be deposited
 * @property depositType - Abbreviation of the type of crypto currency to be deposited
 * @property key - Unique string to identify this transaction as a ShapeShift transaction
 * @property response - Populated with a ShapeShiftResponse object upon transaction completion
 * @property time - Timestamp when this transction was last updated
 */
export interface ShapeShiftTransaction {
	depositAddress: string;
	depositType: string;
	key: string;
	response?: ShapeShiftResponse;
	time: number;
}
/**
 * @type ShapeShiftResponse
 *
 * ShapeShift transaction response object
 *
 * @property status - String indicating transactional status
 */
export interface ShapeShiftResponse {
	status: 'complete' | 'failed' | 'no_deposits' | 'received';
}
/**
 * @type ShapeShiftConfig
 *
 * ShapeShift controller configuration
 *
 * @property interval - Polling interval used to fetch ShapeShift transactions
 */
export interface ShapeShiftConfig extends BaseConfig {
	interval: number;
}
/**
 * @type ShapeShiftState
 *
 * ShapeShift controller state
 *
 * @property shapeShiftTxList - List of ShapeShift transactions
 */
export interface ShapeShiftState extends BaseState {
	shapeShiftTxList: ShapeShiftTransaction[];
}
/**
 * Controller that passively polls on a set interval for ShapeShift transactions
 */
export declare class ShapeShiftController extends BaseController<ShapeShiftConfig, ShapeShiftState> {
	private handle?;
	private getPendingTransactions;
	private getUpdateURL;
	private updateTransaction;
	/**
	 * Name of this controller used during composition
	 */
	name: string;
	/**
	 * Creates a ShapeShiftController instance
	 *
	 * @param config - Initial options used to configure this controller
	 * @param state - Initial state to set on this controller
	 */
	constructor(config?: Partial<ShapeShiftConfig>, state?: Partial<ShapeShiftState>);
	/**
	 * Starts a new polling interval
	 *
	 * @param interval - Polling interval used to fetch new ShapeShift transactions
	 */
	poll(interval?: number): Promise<void>;
	/**
	 * Creates a new ShapeShift transaction
	 *
	 * @param depositAddress - Address where coins should be deposited
	 * @param depositType - Abbreviation of the type of crypto currency to be deposited
	 */
	createTransaction(depositAddress: string, depositType: string): void;
	/**
	 * Updates list of ShapeShift transactions
	 *
	 * @returns - Promise resolving when this operation completes
	 */
	updateTransactionList(): Promise<void>;
}
export default ShapeShiftController;
