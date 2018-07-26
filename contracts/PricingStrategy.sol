pragma solidity 0.4.18;


import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";
import "./interfaces/PricingStrategyInterface.sol";


contract PricingStrategy is PricingStrategyInterface, Claimable, HasNoEther {
    using SafeMath for uint256;

    /** Default token price in wei */
    uint256 public oneTokenInWei;

    event TokenPriceChanged(address _owner, uint256 _oneTokenInWei, uint256 _timestamp);

    /**
     * @dev Setup pricing strategy and set token price. Bonus price is set by default - 1700PXT for 1 ether
     */
    function PricingStrategy() public {
        switchToBonusPrice();
    }

    /**
     * @dev Interface method for checking pricing strategy
     */
    function isPricingStrategy() public constant returns (bool) {
        return true;
    }

    /**
     * @dev Calculate the current token amount for sent wei.
     * @param _weiSent Count wei sent
     * @param _decimals Count of decimals of the token
     * @return Amount of tokens for send wei
     */
    function calculateTokenAmount(uint256 _weiSent, uint256 _decimals) public constant returns (uint256 tokens)
    {
        uint256 multiplier = 10 ** _decimals;
        tokens = _weiSent.mul(multiplier) / oneTokenInWei;
    }

    /**
     * @dev Switch to bonus token price. 1700PXT for 1 ether
     */
    function switchToBonusPrice() onlyOwner public {
        oneTokenInWei = 1 ether / uint256(1700);
        TokenPriceChanged(msg.sender, oneTokenInWei, now);
    }

    /**
     * @dev Switch to default token price. 1224PXT for 1 ether
     */
    function switchToDefaultPrice() onlyOwner public {
        oneTokenInWei = 1 ether / uint256(1224);
        TokenPriceChanged(msg.sender, oneTokenInWei, now);
    }
}

