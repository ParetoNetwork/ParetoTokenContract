pragma solidity 0.4.18;


import "./interfaces/PricingStrategyInterface.sol";
import "./interfaces/TokenInterface.sol";
import "../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/zeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";


contract CrowdSale is Pausable, Claimable {
    using SafeMath for uint256;

    /** 40% of tokens are available for sale */
    uint256 public constant TOKEN_TOTAL_PURCHASE_CAP = 200000000 * (10 ** 18);

    TokenInterface public token;

    PricingStrategyInterface public pricingStrategy;

    uint256 public finalizedTimestamp;

    bool public isFinalized = false;

    address public wallet;

    uint256 public weiRaised;

    uint256 public tokensSold;

    uint256 public investorCount;

    /** Invested by users. */
    mapping (address => uint256) public investedAmountOf;

    /** Tokens by users. */
    mapping (address => uint256) public tokenAmountOf;

    /** A new investment was made */
    event Invested(address indexed _investor, uint256 _weiAmount, uint256 _tokenAmount);

    /** CrowdSale was finalized */
    event Finalized();

    /** PricingStrategy was changed */
    event PricingStrategyChanged(address _oldStragey, address _newStrategy, uint256 _timestamp, address _changedBy);

    /**
     * @dev CrowdSale constructor
     */
    function CrowdSale(TokenInterface _token, PricingStrategyInterface _pricingStrategy, address _wallet) {
        token = _token;
        require(token.isToken());

        wallet = _wallet;
        require(wallet != address(0));

        setPricingStrategy(_pricingStrategy);
    }

    /**
     * @dev Is purchase is valid
     */
    modifier validPurchase() {
        require(msg.value > 0);
        require(!isFinalized);
        _;
    }

    /**
     * @dev Fallback invest function
     */
    function() payable {
        invest();
    }

    /**
     * @dev Main function where investors should call to make a funding
     */
    function invest() validPurchase whenNotPaused public payable {
        uint256 weiAmount = msg.value;
        address receiver = msg.sender;

        uint256 tokenAmount = pricingStrategy.calculateTokenAmount(weiAmount, token.decimals());

        require(tokenAmount > 0);
        require(isNotReachedTokensTotalPurchaseCap(tokenAmount));

        if (investedAmountOf[receiver] == 0) {
            // A new investor
            investorCount++;
        }

        // Update investor counters.
        investedAmountOf[receiver] = investedAmountOf[receiver].add(weiAmount);
        tokenAmountOf[receiver] = tokenAmountOf[receiver].add(tokenAmount);

        // Update total counters
        weiRaised = weiRaised.add(weiAmount);
        tokensSold = tokensSold.add(tokenAmount);

        //Assign tokens
        assignTokens(receiver, tokenAmount);

        //Send ether to RefundVault
        forwardFunds(weiAmount);

        // Tell us invest was success
        Invested(receiver, weiAmount, tokenAmount);
    }

    /**
     * @dev Allow to change pricing strategy by the owner
     */
    function setPricingStrategy(PricingStrategyInterface _pricingStrategy) onlyOwner public {
        address oldPricingStrategy = pricingStrategy;
        pricingStrategy = _pricingStrategy;
        require(pricingStrategy.isPricingStrategy());

        PricingStrategyChanged(oldPricingStrategy, pricingStrategy, now, msg.sender);
    }

    /**
     * @dev Finalize the CrowdSale and burn all rest tokens from the pool
     */
    function finalize() onlyOwner public {
        require(!isFinalized);

        isFinalized = true;
        finalizedTimestamp = now;

        Finalized();
    }

    /**
     * @dev Calculating available tokens to spend by the crowdsale
     */
    function getAvailableTokensToSell() public constant returns (uint256) {
        return TOKEN_TOTAL_PURCHASE_CAP - tokensSold;
    }

    /**
     * @dev Could we sell passed amount of tokens
     */
    function isNotReachedTokensTotalPurchaseCap(uint256 _tokensAmount) public constant returns (bool) {
        return _tokensAmount <= getAvailableTokensToSell();
    }

    /**
     * @dev Forward invested fund to refund vault
     */
    function forwardFunds(uint256 _weiAmount) internal {
        wallet.transfer(_weiAmount);
    }

    /**
     * @dev Assign tokens to the investor
     */
    function assignTokens(address _receiver, uint256 _tokenAmount) internal {
        token.transferFrom(owner, _receiver, _tokenAmount);
    }
}
