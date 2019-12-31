/// <reference types="node" />
import { EventEmitter } from 'events';
import BaseController, { BaseConfig, BaseState } from '../BaseController';
/**
 * @type Result
 *
 * @property result - Promise resolving to a new transaction hash
 * @property transactionMeta - Meta information about this new transaction
 */
export interface Result {
	result: Promise<string>;
	transactionMeta: TransactionMeta;
}
/**
 * @type Transaction
 *
 * Transaction representation
 *
 * @property chainId - Network ID as per EIP-155
 * @property data - Data to pass with this transaction
 * @property from - Address to send this transaction from
 * @property gas - Gas to send with this transaction
 * @property gasPrice - Price of gas with this transaction
 * @property nonce - Unique number to prevent replay attacks
 * @property to - Address to send this transaction to
 * @property value - Value associated with this transaction
 */
export interface Transaction {
	chainId?: number;
	data?: string;
	from: string;
	gas?: string;
	gasPrice?: string;
	nonce?: string;
	to?: string;
	value?: string;
}
/**
 * @type TransactionMeta
 *
 * TransactionMeta representation
 *
 * @property error - Synthesized error information for failed transactions
 * @property id - Generated UUID associated with this transaction
 * @property networkID - Network code as per EIP-155 for this transaction
 * @property origin - Origin this transaction was sent from
 * @property rawTransaction - Hex representation of the underlying transaction
 * @property status - String status of this transaction
 * @property time - Timestamp associated with this transaction
 * @property toSmartContract - Whether transaction recipient is a smart contract
 * @property transaction - Underlying Transaction object
 * @property transactionHash - Hash of a successful transaction
 * @property blockNumber - Number of the block where the transaction has been included
 */
export interface TransactionMeta {
	error?: {
		message: string;
		stack?: string;
	};
	id: string;
	networkID?: string;
	origin?: string;
	rawTransaction?: string;
	status: string;
	time: number;
	toSmartContract?: boolean;
	transaction: Transaction;
	transactionHash?: string;
	blockNumber?: string;
}
/**
 * @type EtherscanTransactionMeta
 *
 * EtherscanTransactionMeta representation
 * @property blockNumber - Number of the block where the transaction has been included
 * @property timeStamp - Timestamp associated with this transaction
 * @property hash - Hash of a successful transaction
 * @property nonce - Nonce of the transaction
 * @property blockHash - Hash of the block where the transaction has been included
 * @property transactionIndex - Etherscan internal index for this transaction
 * @property from - Address to send this transaction from
 * @property to - Address to send this transaction to
 * @property gas - Gas to send with this transaction
 * @property gasPrice - Price of gas with this transaction
 * @property isError - Synthesized error information for failed transactions
 * @property txreceipt_status - Receipt status for this transaction
 * @property input - input of the transaction
 * @property contractAddress - Address of the contract
 * @property cumulativeGasUsed - Amount of gas used
 * @property confirmations - Number of confirmations
 *
 */
export interface EtherscanTransactionMeta {
	blockNumber: string;
	timeStamp: string;
	hash: string;
	nonce: string;
	blockHash: string;
	transactionIndex: string;
	from: string;
	to: string;
	value: string;
	gas: string;
	gasPrice: string;
	isError: string;
	txreceipt_status: string;
	input: string;
	contractAddress: string;
	cumulativeGasUsed: string;
	gasUsed: string;
	confirmations: string;
}
/**
 * @type TransactionConfig
 *
 * Transaction controller configuration
 *
 * @property interval - Polling interval used to fetch new currency rate
 * @property provider - Provider used to create a new underlying EthQuery instance
 * @property sign - Method used to sign transactions
 */
export interface TransactionConfig extends BaseConfig {
	interval: number;
	provider: any;
	sign?: (transaction: Transaction, from: string) => Promise<any>;
}
/**
 * @type MethodData
 *
 * Method data registry object
 *
 * @property registryMethod - Registry method raw string
 * @property parsedRegistryMethod - Registry method object, containing name and method arguments
 */
export interface MethodData {
	registryMethod: string;
	parsedRegistryMethod: object;
}
/**
 * @type TransactionState
 *
 * Transaction controller state
 *
 * @property transactions - A list of TransactionMeta objects
 * @property methodData - Object containing all known method data information
 */
export interface TransactionState extends BaseState {
	transactions: TransactionMeta[];
	methodData: {
		[key: string]: MethodData;
	};
}
/**
 * Multiplier used to determine a transaction's increased gas fee during cancellation
 */
export declare const CANCEL_RATE = 1.5;
/**
 * Multiplier used to determine a transaction's increased gas fee during speed up
 */
export declare const SPEED_UP_RATE = 1.1;
/**
 * Controller responsible for submitting and managing transactions
 */
export declare class TransactionController extends BaseController<TransactionConfig, TransactionState> {
	private ethQuery;
	private registry;
	private handle?;
	private mutex;
	private failTransaction;
	private query;
	private registryLookup;
	/**
	 * Normalizes the transaction information from etherscan
	 * to be compatible with the TransactionMeta interface
	 *
	 * @param txMeta - Object containing the transaction information
	 * @param currentNetworkID - string representing the current network id
	 * @returns - TransactionMeta
	 */
	private normalizeTxFromEtherscan;
	/**
	 * EventEmitter instance used to listen to specific transactional events
	 */
	hub: EventEmitter;
	/**
	 * Name of this controller used during composition
	 */
	name: string;
	/**
	 * List of required sibling controllers this controller needs to function
	 */
	requiredControllers: string[];
	/**
	 * Method used to sign transactions
	 */
	sign?: (transaction: Transaction, from: string) => Promise<void>;
	/**
	 * Creates a TransactionController instance
	 *
	 * @param config - Initial options used to configure this controller
	 * @param state - Initial state to set on this controller
	 */
	constructor(config?: Partial<TransactionConfig>, state?: Partial<TransactionState>);
	/**
	 * Starts a new polling interval
	 *
	 * @param interval - Polling interval used to fetch new transaction statuses
	 */
	poll(interval?: number): Promise<void>;
	/**
	 * Handle new method data request
	 *
	 * @param fourBytePrefix - String corresponding to method prefix
	 * @returns - Promise resolving to method data object corresponding to signature prefix
	 */
	handleMethodData(fourBytePrefix: string): Promise<MethodData>;
	/**
	 * Add a new unapproved transaction to state. Parameters will be validated, a
	 * unique transaction id will be generated, and gas and gasPrice will be calculated
	 * if not provided. If A `<tx.id>:unapproved` hub event will be emitted once added.
	 *
	 * @param transaction - Transaction object to add
	 * @param origin - Domain origin to append to the generated TransactionMeta
	 * @returns - Object containing a promise resolving to the transaction hash if approved
	 */
	addTransaction(transaction: Transaction, origin?: string): Promise<Result>;
	/**
	 * Approves a transaction and updates it's status in state. If this is not a
	 * retry transaction, a nonce will be generated. The transaction is signed
	 * using the sign configuration property, then published to the blockchain.
	 * A `<tx.id>:finished` hub event is fired after success or failure.
	 *
	 * @param transactionID - ID of the transaction to approve
	 * @returns - Promise resolving when this operation completes
	 */
	approveTransaction(transactionID: string): Promise<void>;
	/**
	 * Cancels a transaction based on its ID by setting its status to "rejected"
	 * and emitting a `<tx.id>:finished` hub event.
	 *
	 * @param transactionID - ID of the transaction to cancel
	 */
	cancelTransaction(transactionID: string): void;
	/**
	 * Attempts to cancel a transaction based on its ID by setting its status to "rejected"
	 * and emitting a `<tx.id>:finished` hub event.
	 *
	 * @param transactionID - ID of the transaction to cancel
	 */
	stopTransaction(transactionID: string): Promise<void>;
	/**
	 * Attemps to speed up a transaction increasing transaction gasPrice by ten percent
	 *
	 * @param transactionID - ID of the transaction to speed up
	 */
	speedUpTransaction(transactionID: string): Promise<void>;
	/**
	 * Estimates required gas for a given transaction
	 *
	 * @param transaction - Transaction object to estimate gas for
	 * @returns - Promise resolving to an object containing gas and gasPrice
	 */
	estimateGas(
		transaction: Transaction
	): Promise<{
		gas: string;
		gasPrice: any;
	}>;
	/**
	 * Extension point called if and when this controller is composed
	 * with other controllers using a ComposableController
	 */
	onComposed(): void;
	/**
	 * Resiliently checks all submitted transactions on the blockchain
	 * and verifies that it has been included in a block
	 * when that happens, the tx status is updated to confirmed
	 *
	 * @returns - Promise resolving when this operation completes
	 */
	queryTransactionStatuses(): Promise<void>;
	/**
	 * Updates an existing transaction in state
	 *
	 * @param transactionMeta - New transaction meta to store in state
	 */
	updateTransaction(transactionMeta: TransactionMeta): void;
	/**
	 * Removes all transactions from state, optionally based on the current network
	 *
	 * @param ignoreNetwork - Ignores network
	 */
	wipeTransactions(ignoreNetwork?: boolean): void;
	/**
	 * Gets all transactions from etherscan for a specific address
	 * optionally starting from a specific block
	 *
	 * @param address - string representing the address to fetch the transactions from
	 * @param fromBlock - string representing the block number (optional)
	 * @returns - Promise resolving to an string containing the block number of the latest incoming transaction.
	 */
	fetchAll(address: string, fromBlock?: string): Promise<string | void>;
}
export default TransactionController;
