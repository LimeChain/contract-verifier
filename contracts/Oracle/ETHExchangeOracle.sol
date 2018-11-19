pragma solidity ^0.4.23;

import "./ExchangeOracle.sol";


contract ETHExchangeOracle is ExchangeOracle {

    constructor(address _admin, uint256 _initialRate) ExchangeOracle(_admin, _initialRate) public {}

    /*
     * Converts the specified USD amount in wei (usdAmount is multiplied by
     * corresponding usdMultiplier value, which by default is 100).
     */
    function convertUSDToWei(uint256 _usdAmount) public view returns (uint256) {
        return usdToWei(_usdAmount, rate);
    }

    /*
     * Converts the specified USD amount in wei (usdAmount is multiplied by
     * corresponding usdMultiplier value, which by default is 100) using the
     * lastRate value for the calculation.
     */
    function convertUSDToWeiByLastRate(uint256 _usdAmount) public view returns (uint256) {
        return usdToWei(_usdAmount, lastRate);
    }

    /*
     * Converts the specified USD amount in wei.
     *
     * Example:
     *    ETH/USD -> 298.758
     *    convert -> 39.99 USD
     *
     *                  usdAmount     rateMultiplier
     *    weiAmount = ------------- * -------------- * ONE_ETHER_IN_WEI
     *                usdMultiplier        rate
     *
     */
    function usdToWei(uint256 _usdAmount, uint256 _rate) internal view returns (uint256) {
        require(_usdAmount > 0, "Invalid USD amount");

        uint256 weiAmount = _usdAmount.mul(rateMultiplier);
        weiAmount = weiAmount.mul(1 ether);
        weiAmount = weiAmount.div(usdMultiplier);
        weiAmount = weiAmount.div(_rate);

        return weiAmount;
    }

    /*
     * Converts the specified wei amount in USD. The returned value is multiplied
     * by the usdMultiplier value, which is by default 100.
     */
    function convertWeiToUSD(uint256 _weiAmount) public view returns (uint256) {
        return weiToUSD(_weiAmount, rate);
    }

    /*
     * Converts the specified wei amount in USD, using the lastRate value for the
     * calculation. The returned value is multiplied by the usdMultiplier value,
     * which is by default 100.
     */
    function convertWeiToUSDByLastRate(uint256 _weiAmount) public view returns (uint256) {
        return weiToUSD(_weiAmount, lastRate);
    }

    /*
     * Converts the specified wei amount in USD.
     *
     * Example:
     *    Token/USD -> 250.000
     *    convert   -> 159960000000000000
     *
     *                   weiAmount            rate
     *    usdAmount = ---------------- * -------------- * usdMultiplier
     *                ONE_ETHER_IN_WEI   rateMultiplier
     *
     */
    function weiToUSD(uint256 _weiAmount, uint256 _rate) internal view returns (uint256) {
        require(_weiAmount > 0, "Invalid wei amount");

        uint256 usdAmount = _weiAmount.mul(_rate);
        usdAmount = usdAmount.mul(usdMultiplier);
        usdAmount = usdAmount.div(rateMultiplier);
        usdAmount = usdAmount.div(1 ether);

        return usdAmount;
    }

}