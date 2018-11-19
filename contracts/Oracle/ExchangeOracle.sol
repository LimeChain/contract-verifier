pragma solidity ^0.4.23;

import "../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "./../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";


contract ExchangeOracle is Ownable {

    using SafeMath for uint256;

    uint256 public rate;
    uint256 public lastRate;
    uint256 public rateMultiplier = 1000;
    uint256 public usdMultiplier = 100;
    address public admin;

    event RateChanged(uint256 _oldRate, uint256 _newRate);
    event RateMultiplierChanged(uint256 _oldRateMultiplier, uint256 _newRateMultiplier);
    event USDMultiplierChanged(uint256 _oldUSDMultiplier, uint256 _newUSDMultiplier);
    event AdminChanged(address _oldAdmin, address _newAdmin);

    constructor(address _initialAdmin, uint256 _initialRate) public {
        require(_initialAdmin != address(0), "Invalid initial admin address");
        require(_initialRate > 0, "Invalid initial rate value");

        admin = _initialAdmin;
        rate = _initialRate;
        lastRate = _initialRate;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not allowed to execute");
        _;
    }

    /*
     * The new rate has to be passed in format:
     *      250.567 rate = 250 567 passed rate ( 1 ether = 250.567 USD )
     *      100 rate = 100 000 passed rate ( 1 ether = 100 USD )
     *      1 rate = 1 000 passed rate ( 1 ether = 1 USD )
     *      0.01 rate = 10 passed rate ( 100 ethers = 1 USD )
     */
    function setRate(uint256 _newRate) public onlyAdmin {
        require(_newRate > 0, "Invalid rate value");

        lastRate = rate;
        rate = _newRate;

        emit RateChanged(lastRate, _newRate);
    }

    /*
     * By default rateMultiplier = 1000.
     * With rate multiplier we can set the rate to be a float number.
     *
     * We use it as a multiplier because we can not pass float numbers in Ethereum.
     * If the USD price becomes bigger than ether one, for example -> 1 USD = 10 ethers.
     * We will pass 100 as rate and this will be relevant to 0.1 USD = 1 ether.
     */
    function setRateMultiplier(uint256 _newRateMultiplier) public onlyAdmin {
        require(_newRateMultiplier > 0, "Invalid rate multiplier value");

        uint256 oldRateMultiplier = rateMultiplier;
        rateMultiplier = _newRateMultiplier;

        emit RateMultiplierChanged(oldRateMultiplier, _newRateMultiplier);
    }

    /*
     * By default usdMultiplier is = 100.
     * With usd multiplier we can set the usd amount to be a float number.
     *
     * We use it as a multiplier because we can not pass float numbers in Ethereum.
     * We will pass 100 as usd amount and this will be relevant to 1 USD.
     */
    function setUSDMultiplier(uint256 _newUSDMultiplier) public onlyAdmin {
        require(_newUSDMultiplier > 0, "Invalid USD multiplier value");

        uint256 oldUSDMultiplier = usdMultiplier;
        usdMultiplier = _newUSDMultiplier;

        emit USDMultiplierChanged(oldUSDMultiplier, _newUSDMultiplier);
    }

    /*
     * Set address with admin rights, allowed to execute:
     *    - setRate()
     *    - setRateMultiplier()
     *    - setUSDMultiplier()
     */
    function setAdmin(address _newAdmin) public onlyOwner {
        require(_newAdmin != address(0), "Invalid admin address");

        address oldAdmin = admin;
        admin = _newAdmin;

        emit AdminChanged(oldAdmin, _newAdmin);
    }

}