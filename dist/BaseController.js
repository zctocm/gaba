"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Controller class that provides configuration, state management, and subscriptions
 */
class BaseController {
    /**
     * Creates a BaseController instance. Both initial state and initial
     * configuration options are merged with defaults upon initialization.
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config = {}, state = {}) {
        /**
         * Map of all sibling child controllers keyed by name if this
         * controller is composed using a ComposableController, allowing
         * any API on any sibling controller to be accessed
         */
        this.context = {};
        /**
         * Default options used to configure this controller
         */
        this.defaultConfig = {};
        /**
         * Default state set on this controller
         */
        this.defaultState = {};
        /**
         * Determines if listeners are notified of state changes
         */
        this.disabled = false;
        /**
         * Name of this controller used during composition
         */
        this.name = 'BaseController';
        /**
         * List of required sibling controllers this controller needs to function
         */
        this.requiredControllers = [];
        this.internalConfig = this.defaultConfig;
        this.internalState = this.defaultState;
        this.internalListeners = [];
        // Use assign since generics can't be spread: https://git.io/vpRhY
        /* tslint:disable:prefer-object-spread */
        this.initialState = state;
        this.initialConfig = config;
    }
    /**
     * Enables the controller. This sets each config option as a member
     * variable on this instance and triggers any defined setters. This
     * also sets initial state and triggers any listeners.
     *
     * @returns - This controller instance
     */
    initialize() {
        this.internalState = this.defaultState;
        this.internalConfig = this.defaultConfig;
        this.configure(this.initialConfig);
        this.update(this.initialState);
        return this;
    }
    /**
     * Retrieves current controller configuration options
     *
     * @returns - Current configuration
     */
    get config() {
        return this.internalConfig;
    }
    /**
     * Retrieves current controller state
     *
     * @returns - Current state
     */
    get state() {
        return this.internalState;
    }
    /**
     * Updates controller configuration
     *
     * @param config - New configuration options
     * @param overwrite - Overwrite config instead of merging
     * @param fullUpdate - Boolean that defines if the update is partial or not
     */
    configure(config, overwrite = false, fullUpdate = true) {
        if (fullUpdate) {
            this.internalConfig = overwrite ? config : Object.assign(this.internalConfig, config);
            for (const key in this.internalConfig) {
                if (typeof this.internalConfig[key] !== 'undefined') {
                    this[key] = this.internalConfig[key];
                }
            }
        }
        else {
            for (const key in config) {
                /* istanbul ignore else */
                if (typeof this.internalConfig[key] !== 'undefined') {
                    this.internalConfig[key] = config[key];
                    this[key] = config[key];
                }
            }
        }
    }
    /**
     * Notifies all subscribed listeners of current state
     */
    notify() {
        if (this.disabled) {
            return;
        }
        this.internalListeners.forEach((listener) => {
            listener(this.internalState);
        });
    }
    /**
     * Extension point called if and when this controller is composed
     * with other controllers using a ComposableController
     */
    onComposed() {
        this.requiredControllers.forEach((name) => {
            if (!this.context[name]) {
                throw new Error(`${this.name} must be composed with ${name}.`);
            }
        });
    }
    /**
     * Adds new listener to be notified of state changes
     *
     * @param listener - Callback triggered when state changes
     */
    subscribe(listener) {
        this.internalListeners.push(listener);
    }
    /**
     * Removes existing listener from receiving state changes
     *
     * @param listener - Callback to remove
     * @returns - True if a listener is found and unsubscribed
     */
    unsubscribe(listener) {
        const index = this.internalListeners.findIndex((cb) => listener === cb);
        index > -1 && this.internalListeners.splice(index, 1);
        return index > -1;
    }
    /**
     * Updates controller state
     *
     * @param state - New state
     * @param overwrite - Overwrite state instead of merging
     */
    update(state, overwrite = false) {
        this.internalState = overwrite ? Object.assign({}, state) : Object.assign({}, this.internalState, state);
        this.notify();
    }
}
exports.BaseController = BaseController;
exports.default = BaseController;
//# sourceMappingURL=BaseController.js.map