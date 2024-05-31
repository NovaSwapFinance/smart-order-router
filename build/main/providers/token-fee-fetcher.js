"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnChainTokenFeeFetcher = exports.DEFAULT_TOKEN_FEE_RESULT = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const sdk_core_1 = require("@novaswap/sdk-core");
const TokenFeeDetector__factory_1 = require("../types/other/factories/TokenFeeDetector__factory");
const util_1 = require("../util");
const DEFAULT_TOKEN_BUY_FEE_BPS = bignumber_1.BigNumber.from(0);
const DEFAULT_TOKEN_SELL_FEE_BPS = bignumber_1.BigNumber.from(0);
// on detector failure, assume no fee
exports.DEFAULT_TOKEN_FEE_RESULT = {
    buyFeeBps: DEFAULT_TOKEN_BUY_FEE_BPS,
    sellFeeBps: DEFAULT_TOKEN_SELL_FEE_BPS,
};
// TDOO: monitor FeeDetector address
// address at which the FeeDetector lens is deployed
const FEE_DETECTOR_ADDRESS = (chainId) => {
    switch (chainId) {
        case sdk_core_1.ChainId.MAINNET:
            return '0x19C97dc2a25845C7f9d1d519c8C2d4809c58b43f';
        case sdk_core_1.ChainId.OPTIMISM:
            return '0xa7c17505B43955A474fb6AFE61E093907a7567c9';
        case sdk_core_1.ChainId.BNB:
            return '0x331f6D0AAB4A1F039f0d75A613a7F1593DbDE1BB';
        case sdk_core_1.ChainId.POLYGON:
            return '0x92bCCCb6c8c199AAcA38408621E38Ab6dBfA00B5';
        case sdk_core_1.ChainId.BASE:
            return '0x331f6D0AAB4A1F039f0d75A613a7F1593DbDE1BB';
        case sdk_core_1.ChainId.ARBITRUM_ONE:
            return '0x64CF365CC5CCf5E64380bc05Acd5df7D0618c118';
        case sdk_core_1.ChainId.CELO:
            return '0x3dfF0145E68a5880EAbE8F56b6Bc30C4AdCF3413';
        case sdk_core_1.ChainId.AVALANCHE:
            return '0xBF2B9F6A6eCc4541b31ab2dCF8156D33644Ca3F3';
        default:
            // just default to mainnet contract
            return '0x19C97dc2a25845C7f9d1d519c8C2d4809c58b43f';
    }
};
// Amount has to be big enough to avoid rounding errors, but small enough that
// most v2 pools will have at least this many token units
// 100000 is the smallest number that avoids rounding errors in bps terms
// 10000 was not sufficient due to rounding errors for rebase token (e.g. stETH)
const AMOUNT_TO_FLASH_BORROW = '100000';
// 1M gas limit per validate call, should cover most swap cases
const GAS_LIMIT_PER_VALIDATE = 1000000;
class OnChainTokenFeeFetcher {
    constructor(chainId, rpcProvider, tokenFeeAddress = FEE_DETECTOR_ADDRESS(chainId), gasLimitPerCall = GAS_LIMIT_PER_VALIDATE, amountToFlashBorrow = AMOUNT_TO_FLASH_BORROW) {
        var _a;
        this.chainId = chainId;
        this.tokenFeeAddress = tokenFeeAddress;
        this.gasLimitPerCall = gasLimitPerCall;
        this.amountToFlashBorrow = amountToFlashBorrow;
        this.BASE_TOKEN = (_a = util_1.WRAPPED_NATIVE_CURRENCY[this.chainId]) === null || _a === void 0 ? void 0 : _a.address;
        this.contract = TokenFeeDetector__factory_1.TokenFeeDetector__factory.connect(this.tokenFeeAddress, rpcProvider);
    }
    async fetchFees(addresses, providerConfig) {
        const tokenToResult = {};
        const addressesWithoutBaseToken = addresses.filter((address) => address.toLowerCase() !== this.BASE_TOKEN.toLowerCase());
        const functionParams = addressesWithoutBaseToken.map((address) => [
            address,
            this.BASE_TOKEN,
            this.amountToFlashBorrow,
        ]);
        const results = await Promise.all(functionParams.map(async ([address, baseToken, amountToBorrow]) => {
            try {
                // We use the validate function instead of batchValidate to avoid poison pill problem.
                // One token that consumes too much gas could cause the entire batch to fail.
                const feeResult = await this.contract.callStatic.validate(address, baseToken, amountToBorrow, {
                    gasLimit: this.gasLimitPerCall,
                    blockTag: providerConfig === null || providerConfig === void 0 ? void 0 : providerConfig.blockNumber,
                });
                util_1.metric.putMetric('TokenFeeFetcherFetchFeesSuccess', 1, util_1.MetricLoggerUnit.Count);
                return Object.assign({ address }, feeResult);
            }
            catch (err) {
                util_1.log.error({ err }, `Error calling validate on-chain for token ${address}`);
                util_1.metric.putMetric('TokenFeeFetcherFetchFeesFailure', 1, util_1.MetricLoggerUnit.Count);
                // in case of FOT token fee fetch failure, we return null
                // so that they won't get returned from the token-fee-fetcher
                // and thus no fee will be applied, and the cache won't cache on FOT tokens with failed fee fetching
                return { address, buyFeeBps: undefined, sellFeeBps: undefined };
            }
        }));
        results.forEach(({ address, buyFeeBps, sellFeeBps }) => {
            if (buyFeeBps || sellFeeBps) {
                tokenToResult[address] = { buyFeeBps, sellFeeBps };
            }
        });
        return tokenToResult;
    }
}
exports.OnChainTokenFeeFetcher = OnChainTokenFeeFetcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tZmVlLWZldGNoZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcHJvdmlkZXJzL3Rva2VuLWZlZS1mZXRjaGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHdEQUFxRDtBQUVyRCxpREFBNkM7QUFHN0Msa0dBQStGO0FBQy9GLGtDQUtpQjtBQUlqQixNQUFNLHlCQUF5QixHQUFHLHFCQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3BELE1BQU0sMEJBQTBCLEdBQUcscUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFckQscUNBQXFDO0FBQ3hCLFFBQUEsd0JBQXdCLEdBQUc7SUFDdEMsU0FBUyxFQUFFLHlCQUF5QjtJQUNwQyxVQUFVLEVBQUUsMEJBQTBCO0NBQ3ZDLENBQUM7QUFVRixvQ0FBb0M7QUFFcEMsb0RBQW9EO0FBQ3BELE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxPQUFnQixFQUFFLEVBQUU7SUFDaEQsUUFBUSxPQUFPLEVBQUU7UUFDZixLQUFLLGtCQUFPLENBQUMsT0FBTztZQUNsQixPQUFPLDRDQUE0QyxDQUFDO1FBQ3RELEtBQUssa0JBQU8sQ0FBQyxRQUFRO1lBQ25CLE9BQU8sNENBQTRDLENBQUM7UUFDdEQsS0FBSyxrQkFBTyxDQUFDLEdBQUc7WUFDZCxPQUFPLDRDQUE0QyxDQUFDO1FBQ3RELEtBQUssa0JBQU8sQ0FBQyxPQUFPO1lBQ2xCLE9BQU8sNENBQTRDLENBQUM7UUFDdEQsS0FBSyxrQkFBTyxDQUFDLElBQUk7WUFDZixPQUFPLDRDQUE0QyxDQUFDO1FBQ3RELEtBQUssa0JBQU8sQ0FBQyxZQUFZO1lBQ3ZCLE9BQU8sNENBQTRDLENBQUM7UUFDdEQsS0FBSyxrQkFBTyxDQUFDLElBQUk7WUFDZixPQUFPLDRDQUE0QyxDQUFDO1FBQ3RELEtBQUssa0JBQU8sQ0FBQyxTQUFTO1lBQ3BCLE9BQU8sNENBQTRDLENBQUM7UUFDdEQ7WUFD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