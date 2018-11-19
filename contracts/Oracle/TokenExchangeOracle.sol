pragma solidity ^0.4.23;

import "./ExchangeOracle.sol";


contract TokenExchangeOracle is ExchangeOracle {

    constructor(address _admin, uint256 _initialRate) ExchangeOracle(_admin, _initialRate) public {}

    /*
     * Converts the specified USD amount in tokens (usdAmount is multiplied by
     * corresponding usdMultiplier value, which by default is 100).
     */
    function convertUSDToTokens(uint256 _usdAmount) public view returns (uint256) {
        return usdToTokens(_usdAmount, rate);
    }

    /*
     * Converts the specified USD amount in tokens (usdAmount is multiplied by
     * corresponding usdMultiplier value, which by default is 100) using the
     * lastRate value for the calculation.
     */
    function convertUSDToTokensByLastRate(uint256 _usdAmount) public view returns (uint256) {
        return usdToTokens(_usdAmount, lastRate);
    }

    /*
     * Converts the specified USD amount in tokens.
     *
     * Example:
     *    Token/USD -> 298.758
     *    convert -> 39.99 USD
     *
     *               usdAmount     rateMultiplier
     *    tokens = ------------- * -------------- * ONE_ETHER_IN_WEI
     *             usdMultiplier        rate
     *
     */
    function usdToTokens(uint256 _usdAmount, uint256 _rate) internal view returns (uint256) {
        require(_usdAmount > 0, "Invalid USD amount");

        uint256 tokens = _usdAmount.mul(rateMultiplier);
        tokens = tokens.mul(1 ether);
        tokens = tokens.div(usdMultiplier);
        tokens = tokens.div(_rate);

        return tokens;
    }

    /*
     * Converts the specified tokens amount in USD. The returned value is multiplied
     * by the usdMultiplier value, which is by default 100.
     */
    function convertTokensToUSD(uint256 _tokens) public view returns (uint256) {
        return tokensToUSD(_tokens, rate);
    }

    /*
     * Converts the specified tokens amount in USD, using the lastRate value for the
     * calculation. The returned value is multiplied by the usdMultiplier value,
     * which is by default 100.
     */
    function convertTokensToUSDByLastRate(uint256 _tokens) public view returns (uint256) {
        return tokensToUSD(_tokens, lastRate);
    }

    /*
     * Converts the specified tokens amount in USD.
     *
     *                     tokens             rate
     *    usdAmount = ---------------- * -------------- * usdMultiplier
     *                ONE_ETHER_IN_WEI   rateMultiplier
     *
     */
    function tokensToUSD(uint256 _tokens, uint256 _rate) internal view returns (uint256) {
        require(_tokens > 0, "Invalid token amount");

        uint256 usdAmount = _tokens.mul(_rate);
        usdAmount = usdAmount.mul(usdMultiplier);
        usdAmount = usdAmount.div(rateMultiplier);
        usdAmount = usdAmount.div(1 ether);

        return usdAmount;
    }

}