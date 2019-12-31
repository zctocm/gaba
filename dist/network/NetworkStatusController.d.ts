import BaseController, { BaseConfig, BaseState } from '../BaseController';
/**
 * Network status code string
 */
export declare type Status = 'ok' | 'down' | 'degraded';
/**
 * Network status object
 */
export interface NetworkStatus {
	kovan: Status;
	mainnet: Status;
	rinkeby: Status;
	ropsten: Status;
}
/**
 * @type NetworkStatusConfig
 *
 * Network status controller configuration
 *
 * @property interval - Polling interval used to fetch network status
 */
export interface NetworkStatusConfig extends BaseConfig {
	interval: number;
}
/**
 * @type NetworkStatusState
 *
 * Network status controller state
 *
 * @property networkStatus - Providers mapped to network status objects
 */
export interface NetworkStatusState extends BaseState {
	networkStatus: {
		infura: NetworkStatus;
	};
}
/**
 * Controller that passively polls on a set interval for network status of providers
 */
export declare class NetworkStatusController extends BaseController<NetworkStatusConfig, NetworkStatusState> {
	private handle?;
	/**
	 * Name of this controller used during composition
	 */
	name: string;
	/**
	 * Creates a NetworkStatusController instance
	 *
	 * @param config - Initial options used to configure this controller
	 * @param state - Initial state to set on this controller
	 */
	constructor(config?: Partial<NetworkStatusConfig>, state?: Partial<NetworkStatusState>);
	/**
	 * Starts a new polling interval
	 *
	 * @param interval - Polling interval used to fetch network status
	 */
	poll(interval?: number): Promise<void>;
	/**
	 * Fetches infura network status
	 *
	 * @returns - Promise resolving to an infura network status object
	 */
	updateInfuraStatus(): Promise<NetworkStatus>;
	/**
	 * Updates network status for all providers
	 *
	 * @returns - Promise resolving when this operation completes
	 */
	updateNetworkStatuses(): Promise<void>;
}
export default NetworkStatusController;
