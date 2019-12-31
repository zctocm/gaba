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
const sigUtil = require('eth-sig-util');
const Keyring = require('eth-keyring-controller');
const Mutex = require('await-semaphore').Mutex;
const Wallet = require('ethereumjs-wallet');
const ethUtil = require('ethereumjs-util');
const importers = require('ethereumjs-wallet/thirdparty');
const privates = new WeakMap();
/**
 * Available keyring types
 */
var KeyringTypes;
(function (KeyringTypes) {
    KeyringTypes["simple"] = "Simple Key Pair";
    KeyringTypes["hd"] = "HD Key Tree";
})(KeyringTypes = exports.KeyringTypes || (exports.KeyringTypes = {}));
/**
 * Controller responsible for establishing and managing user identity
 */
class KeyringController extends BaseController_1.default {
    /**
     * Creates a KeyringController instance
     *
     * @param config - Initial options used to configure this controller
     * @param state - Initial state to set on this controller
     */
    constructor(config, state) {
        super(config, state);
        this.mutex = new Mutex();
        /**
         * Name of this controller used during composition
         */
        this.name = 'KeyringController';
        /**
         * List of required sibling controllers this controller needs to function
         */
        this.requiredControllers = ['PreferencesController'];
        privates.set(this, { keyring: new Keyring(Object.assign({ initState: state }, config)) });
        this.defaultState = Object.assign(Object.assign({}, privates.get(this).keyring.store.getState()), { keyrings: [] });
        this.initialize();
        this.fullUpdate();
    }
    /**
     * Adds a new account to the default (first) HD seed phrase keyring
     *
     * @returns - Promise resolving to current state when the account is added
     */
    addNewAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = this.context.PreferencesController;
            const primaryKeyring = privates.get(this).keyring.getKeyringsByType('HD Key Tree')[0];
            /* istanbul ignore if */
            if (!primaryKeyring) {
                throw new Error('No HD keyring found');
            }
            const oldAccounts = yield privates.get(this).keyring.getAccounts();
            yield privates.get(this).keyring.addNewAccount(primaryKeyring);
            const newAccounts = yield privates.get(this).keyring.getAccounts();
            yield this.verifySeedPhrase();
            preferences.updateIdentities(newAccounts);
            newAccounts.forEach((selectedAddress) => {
                if (!oldAccounts.includes(selectedAddress)) {
                    preferences.update({ selectedAddress });
                }
            });
            return this.fullUpdate();
        });
    }
    /**
     * Effectively the same as creating a new keychain then populating it
     * using the given seed phrase
     *
     * @param password - Password to unlock keychain
     * @param seed - Seed phrase to restore keychain
     * @returns - Promise resolving to th restored keychain object
     */
    createNewVaultAndRestore(password, seed) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = this.context.PreferencesController;
            const releaseLock = yield this.mutex.acquire();
            try {
                preferences.updateIdentities([]);
                const vault = yield privates.get(this).keyring.createNewVaultAndRestore(password, seed);
                preferences.updateIdentities(yield privates.get(this).keyring.getAccounts());
                preferences.update({ selectedAddress: Object.keys(preferences.state.identities)[0] });
                this.fullUpdate();
                releaseLock();
                return vault;
            }
            catch (err) /* istanbul ignore next */ {
                releaseLock();
                throw err;
            }
        });
    }
    /**
     * Create a new primary keychain and wipe any previous keychains
     *
     * @param password - Password to unlock the new vault
     * @returns - Newly-created keychain object
     */
    createNewVaultAndKeychain(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = this.context.PreferencesController;
            const releaseLock = yield this.mutex.acquire();
            try {
                const vault = yield privates.get(this).keyring.createNewVaultAndKeychain(password);
                preferences.updateIdentities(yield privates.get(this).keyring.getAccounts());
                preferences.update({ selectedAddress: Object.keys(preferences.state.identities)[0] });
                this.fullUpdate();
                releaseLock();
                return vault;
            }
            catch (err) /* istanbul ignore next */ {
                releaseLock();
                throw err;
            }
        });
    }
    /**
     * Returns the status of the vault
     *
     * @returns - Boolean returning true if the vault is unlocked
     */
    isUnlocked() {
        return privates.get(this).keyring.memStore.getState().isUnlocked;
    }
    /**
     * Gets the seed phrase of the HD keyring
     *
     * @param password - Password of the keyring
     * @returns - Promise resolving to the seed phrase
     */
    exportSeedPhrase(password) {
        if (privates.get(this).keyring.password === password) {
            return privates.get(this).keyring.keyrings[0].mnemonic;
        }
        throw new Error('Invalid password');
    }
    /**
     * Gets the private key from the keyring controlling an address
     *
     * @param password - Password of the keyring
     * @param address - Address to export
     * @returns - Promise resolving to the private key for an address
     */
    exportAccount(password, address) {
        if (privates.get(this).keyring.password === password) {
            return privates.get(this).keyring.exportAccount(address);
        }
        throw new Error('Invalid password');
    }
    /**
     * Returns the public addresses of all accounts for the current keyring
     *
     * @returns - A promise resolving to an array of addresses
     */
    getAccounts() {
        return privates.get(this).keyring.getAccounts();
    }
    /**
     * Imports an account with the specified import strategy
     *
     * @param strategy - Import strategy name
     * @param args - Array of arguments to pass to the underlying stategy
     * @returns - Promise resolving to current state when the import is complete
     */
    importAccountWithStrategy(strategy, args) {
        return __awaiter(this, void 0, void 0, function* () {
            let privateKey;
            const preferences = this.context.PreferencesController;
            switch (strategy) {
                case 'privateKey':
                    const [importedKey] = args;
                    if (!importedKey) {
                        throw new Error('Cannot import an empty key.');
                    }
                    const prefixed = ethUtil.addHexPrefix(importedKey);
                    if (!ethUtil.isValidPrivate(ethUtil.toBuffer(prefixed))) {
                        throw new Error('Cannot import invalid private key.');
                    }
                    privateKey = ethUtil.stripHexPrefix(prefixed);
                    break;
                case 'json':
                    let wallet;
                    const [input, password] = args;
                    try {
                        wallet = importers.fromEtherWallet(input, password);
                    }
                    catch (e) {
                        wallet = wallet || Wallet.fromV3(input, password, true);
                    }
                    privateKey = ethUtil.bufferToHex(wallet.getPrivateKey());
                    break;
            }
            const newKeyring = yield privates.get(this).keyring.addNewKeyring(KeyringTypes.simple, [privateKey]);
            const accounts = yield newKeyring.getAccounts();
            const allAccounts = yield privates.get(this).keyring.getAccounts();
            preferences.updateIdentities(allAccounts);
            preferences.update({ selectedAddress: accounts[0] });
            return this.fullUpdate();
        });
    }
    /**
     * Removes an account from keyring state
     *
     * @param address - Address of the account to remove
     * @returns - Promise resolving current state when this account removal completes
     */
    removeAccount(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = this.context.PreferencesController;
            preferences.removeIdentity(address);
            yield privates.get(this).keyring.removeAccount(address);
            return this.fullUpdate();
        });
    }
    /**
     * Deallocates all secrets and locks the wallet
     *
     * @returns - Promise resolving to current state
     */
    setLocked() {
        return privates.get(this).keyring.setLocked();
    }
    /**
     * Signs message by calling down into a specific keyring
     *
     * @param messageParams - PersonalMessageParams object to sign
     * @returns - Promise resolving to a signed message string
     */
    signMessage(messageParams) {
        return privates.get(this).keyring.signMessage(messageParams);
    }
    /**
     * Signs personal message by calling down into a specific keyring
     *
     * @param messageParams - PersonalMessageParams object to sign
     * @returns - Promise resolving to a signed message string
     */
    signPersonalMessage(messageParams) {
        return privates.get(this).keyring.signPersonalMessage(messageParams);
    }
    /**
     * Signs typed message by calling down into a specific keyring
     *
     * @param messageParams - TypedMessageParams object to sign
     * @param version - Compatibility version EIP712
     * @returns - Promise resolving to a signed message string or an error if any
     */
    signTypedMessage(messageParams, version) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const address = sigUtil.normalize(messageParams.from);
                const password = privates.get(this).keyring.password;
                const privateKey = yield this.exportAccount(password, address);
                const privateKeyBuffer = ethUtil.toBuffer(ethUtil.addHexPrefix(privateKey));
                switch (version) {
                    case 'V1':
                        return sigUtil.signTypedDataLegacy(privateKeyBuffer, { data: messageParams.data });
                    case 'V3':
                        return sigUtil.signTypedData(privateKeyBuffer, { data: JSON.parse(messageParams.data) });
                    case 'V4':
                        return sigUtil.signTypedData_v4(privateKeyBuffer, {
                            data: JSON.parse(messageParams.data)
                        });
                }
            }
            catch (error) {
                throw new Error('Keyring Controller signTypedMessage: ' + error);
            }
        });
    }
    /**
     * Signs a transaction by calling down into a specific keyring
     *
     * @param transaction - Transaction object to sign
     * @param from - Address to sign from, should be in keychain
     * @returns - Promise resolving to a signed transaction string
     */
    signTransaction(transaction, from) {
        return privates.get(this).keyring.signTransaction(transaction, from);
    }
    /**
     * Attempts to decrypt the current vault and load its keyrings
     *
     * @param password - Password to unlock the keychain
     * @returns - Promise resolving to the current state
     */
    submitPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const preferences = this.context.PreferencesController;
            yield privates.get(this).keyring.submitPassword(password);
            const accounts = yield privates.get(this).keyring.getAccounts();
            yield preferences.syncIdentities(accounts);
            return this.fullUpdate();
        });
    }
    /**
     * Adds new listener to be notified of state changes
     *
     * @param listener - Callback triggered when state changes
     */
    subscribe(listener) {
        privates.get(this).keyring.store.subscribe(listener);
    }
    /**
     * Removes existing listener from receiving state changes
     *
     * @param listener - Callback to remove
     * @returns - True if a listener is found and unsubscribed
     */
    unsubscribe(listener) {
        return privates.get(this).keyring.store.unsubscribe(listener);
    }
    /**
     * Verifies the that the seed phrase restores the current keychain's accounts
     *
     * @returns - Promise resolving if the verification succeeds
     */
    verifySeedPhrase() {
        return __awaiter(this, void 0, void 0, function* () {
            const primaryKeyring = privates.get(this).keyring.getKeyringsByType(KeyringTypes.hd)[0];
            /* istanbul ignore if */
            if (!primaryKeyring) {
                throw new Error('No HD keyring found.');
            }
            const seedWords = (yield primaryKeyring.serialize()).mnemonic;
            const accounts = yield primaryKeyring.getAccounts();
            /* istanbul ignore if */
            if (accounts.length === 0) {
                throw new Error('Cannot verify an empty keyring.');
            }
            const TestKeyringClass = privates.get(this).keyring.getKeyringClassForType(KeyringTypes.hd);
            const testKeyring = new TestKeyringClass({ mnemonic: seedWords, numberOfAccounts: accounts.length });
            const testAccounts = yield testKeyring.getAccounts();
            /* istanbul ignore if */
            if (testAccounts.length !== accounts.length) {
                throw new Error('Seed phrase imported incorrect number of accounts.');
            }
            testAccounts.forEach((account, i) => {
                /* istanbul ignore if */
                if (account.toLowerCase() !== accounts[i].toLowerCase()) {
                    throw new Error('Seed phrase imported different accounts.');
                }
            });
            return seedWords;
        });
    }
    /**
     * Update keyrings in state and calls KeyringController fullUpdate method returning current state
     *
     * @returns - Promise resolving to current state
     */
    fullUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            const keyrings = yield Promise.all(privates.get(this).keyring.keyrings.map((keyring, index) => __awaiter(this, void 0, void 0, function* () {
                const keyringAccounts = yield keyring.getAccounts();
                const accounts = Array.isArray(keyringAccounts)
                    ? keyringAccounts.map((address) => ethereumjs_util_1.toChecksumAddress(address))
                    : /* istanbul ignore next */ [];
                return {
                    accounts,
                    index,
                    type: keyring.type
                };
            })));
            this.update({ keyrings: [...keyrings] });
            return privates.get(this).keyring.fullUpdate();
        });
    }
}
exports.KeyringController = KeyringController;
exports.default = KeyringController;
//# sourceMappingURL=KeyringController.js.map