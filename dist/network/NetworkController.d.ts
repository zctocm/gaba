import BaseController, { BaseConfig, BaseState } from '../BaseController';
/**
 * Human-readable network name
 */
export declare type NetworkType = 'kovan' | 'localhost' | 'mainnet' | 'rinkeby' | 'goerli' | 'ropsten' | 'rpc';
/**
 * @type ProviderConfig
 *
 * Configuration passed to web3-provider-engine
 *
 * @param rpcTarget? - RPC target URL
 * @param type - Human-readable network name
 * @param chainId? - Network ID as per EIP-155
 * @param ticker? - Currency ticker
 * @param nickname? - Personalized network name
 */
export interface ProviderConfig {
	rpcTarget?: string;
	type: NetworkType;
	chainId?: string;
	ticker?: string;
	nickname?: string;
}
/**
 * @type NetworkConfig
 *
 * Network controller configuration
 *
 * @property providerConfig - web3-provider-engine configuration
 */
export interface NetworkConfig extends BaseConfig {
	providerConfig: ProviderConfig;
}
/**
 * @type NetworkState
 *
 * Network controller state
 *
 * @property network - Network ID as per net_version
 * @property provider - RPC URL and network name provider settings
 */
export interface NetworkState extends BaseState {
	network: string;
	provider: ProviderConfig;
}
/**
 * Controller that creates and manages an Ethereum network provider
 */
export declare class NetworkController extends BaseController<NetworkConfig, NetworkState> {
	private ethQuery;
	private internalProviderConfig;
	private mutex;
	private initializeProvider;
	private refreshNetwork;
	private registerProvider;
	private setupInfuraProvider;
	private setupStandardProvider;
	private updateProvider;
	private safelyStopProvider;
	private verifyNetwork;
	/**
	 * Name of this controller used during composition
	 */
	name: string;
	/**
	 * Ethereum provider object for the current network
	 */
	provider: any;
	/**
	 * Creates a NetworkController instance
	 *
	 * @param config - Initial options used to configure this controller
	 * @param state - Initial state to set on this controller
	 */
	constructor(config?: Partial<NetworkConfig>, state?: Partial<NetworkState>);
	/**
	 * Sets a new configuration for web3-provider-engine
	 *
	 * @param providerConfig - web3-provider-engine configuration
	 */
	set providerConfig(providerConfig: ProviderConfig);
	/**
	 * Refreshes the current network code
	 */
	lookupNetwork(): Promise<void>;
	/**
	 * Convenience method to update provider network type settings
	 *
	 * @param type - Human readable network name
	 */
	setProviderType(type: NetworkType): void;
	/**
	 * Convenience method to update provider RPC settings
	 *
	 * @param rpcTarget - RPC endpoint URL
	 * @param chainId? - Network ID as per EIP-155
	 * @param ticker? - Currency ticker
	 * @param nickname? - Personalized network name
	 */
	setRpcTarget(rpcTarget: string, chainId?: string, ticker?: string, nickname?: string): void;
}
export default NetworkController;
