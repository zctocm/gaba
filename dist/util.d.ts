import { Transaction } from './transaction/TransactionController';
import { MessageParams } from './message-manager/MessageManager';
import { PersonalMessageParams } from './message-manager/PersonalMessageManager';
import { TypedMessageParams } from './message-manager/TypedMessageManager';
import { Token } from './assets/TokenRatesController';
/**
 * Converts a BN object to a hex string with a '0x' prefix
 *
 * @param inputBn - BN instance to convert to a hex string
 * @returns - '0x'-prefixed hex string
 *
 */
export declare function BNToHex(inputBn: any): string;
/**
 * Used to multiply a BN by a fraction
 *
 * @param targetBN - Number to multiply by a fraction
 * @param numerator - Numerator of the fraction multiplier
 * @param denominator - Denominator of the fraction multiplier
 * @returns - Product of the multiplication
 */
export declare function fractionBN(targetBN: any, numerator: number | string, denominator: number | string): any;
/**
 * Return a URL that can be used to obtain ETH for a given network
 *
 * @param networkCode - Network code of desired network
 * @param address - Address to deposit obtained ETH
 * @param amount - How much ETH is desired
 * @returns - URL to buy ETH based on network
 */
export declare function getBuyURL(networkCode?: string, address?: string, amount?: number): string | undefined;
/**
 * Converts a hex string to a BN object
 *
 * @param inputHex - Number represented as a hex string
 * @returns - A BN instance
 *
 */
export declare function hexToBN(inputHex: string): any;
/**
 * A helper function that converts hex data to human readable string
 *
 * @param hex - The hex string to convert to string
 * @returns - A human readable string conversion
 *
 */
export declare function hexToText(hex: string): string;
/**
 * Normalizes properties on a Transaction object
 *
 * @param transaction - Transaction object to normalize
 * @returns - Normalized Transaction object
 */
export declare function normalizeTransaction(transaction: Transaction): Transaction;
/**
 * Execute and return an asynchronous operation without throwing errors
 *
 * @param operation - Function returning a Promise
 * @param logError - Determines if the error should be logged
 * @param retry - Function called if an error is caught
 * @returns - Promise resolving to the result of the async operation
 */
export declare function safelyExecute(
	operation: () => Promise<any>,
	logError?: boolean,
	retry?: (error: Error) => void
): Promise<any>;
/**
 * Validates a Transaction object for required properties and throws in
 * the event of any validation error.
 *
 * @param transaction - Transaction object to validate
 */
export declare function validateTransaction(transaction: Transaction): void;
/**
 * A helper function that converts rawmessageData buffer data to a hex, or just returns the data if
 * it is already formatted as a hex.
 *
 * @param data - The buffer data to convert to a hex
 * @returns - A hex string conversion of the buffer data
 *
 */
export declare function normalizeMessageData(data: string): string;
/**
 * Validates a PersonalMessageParams and MessageParams objects for required properties and throws in
 * the event of any validation error.
 *
 * @param messageData - PersonalMessageParams object to validate
 */
export declare function validateSignMessageData(messageData: PersonalMessageParams | MessageParams): void;
/**
 * Validates a TypedMessageParams object for required properties and throws in
 * the event of any validation error for eth_signTypedMessage_V1.
 *
 * @param messageData - TypedMessageParams object to validate
 * @param activeChainId - Active chain id
 */
export declare function validateTypedSignMessageDataV1(messageData: TypedMessageParams): void;
/**
 * Validates a TypedMessageParams object for required properties and throws in
 * the event of any validation error for eth_signTypedMessage_V3.
 *
 * @param messageData - TypedMessageParams object to validate
 */
export declare function validateTypedSignMessageDataV3(messageData: TypedMessageParams): void;
/**
 * Validates a ERC20 token to be added with EIP747.
 *
 * @param token - Token object to validate
 */
export declare function validateTokenToWatch(token: Token): void;
/**
 * Returns wether the given code corresponds to a smart contract
 *
 * @returns {string} - Corresponding code to review
 */
export declare function isSmartContractCode(code: string): boolean;
/**
 * Execute fetch and verify that the response was successful
 *
 * @param request - Request information
 * @param options - Options
 * @returns - Promise resolving to the fetch response
 */
export declare function successfulFetch(request: string, options?: RequestInit): Promise<Response>;
/**
 * Execute fetch and return object response
 *
 * @param request - Request information
 * @param options - Options
 * @returns - Promise resolving to the result object of fetch
 */
export declare function handleFetch(request: string, options?: RequestInit): Promise<any>;
/**
 * Fetch that fails after timeout
 *
 * @param url - Url to fetch
 * @param options - Options to send with the request
 * @param timeout - Timeout to fail request
 *
 * @returns - Promise resolving the request
 */
export declare function timeoutFetch(url: string, options?: RequestInit, timeout?: number): Promise<Response>;
/**
 * Normalizes the given ENS name.
 *
 * @param {string} ensName - The ENS name
 *
 * @returns - the normalized ENS name string
 */
export declare function normalizeEnsName(ensName: string): string | null;
declare const _default: {
	BNToHex: typeof BNToHex;
	fractionBN: typeof fractionBN;
	getBuyURL: typeof getBuyURL;
	handleFetch: typeof handleFetch;
	hexToBN: typeof hexToBN;
	hexToText: typeof hexToText;
	isSmartContractCode: typeof isSmartContractCode;
	normalizeTransaction: typeof normalizeTransaction;
	safelyExecute: typeof safelyExecute;
	successfulFetch: typeof successfulFetch;
	timeoutFetch: typeof timeoutFetch;
	validateTokenToWatch: typeof validateTokenToWatch;
	validateTransaction: typeof validateTransaction;
	validateTypedSignMessageDataV1: typeof validateTypedSignMessageDataV1;
	validateTypedSignMessageDataV3: typeof validateTypedSignMessageDataV3;
};
export default _default;
