pragma solidity 0.4.18;


import "./interfaces/TokenInterface.sol";
import "../node_modules/zeppelin-solidity/contracts/token/StandardToken.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/HasNoEther.sol";
import "../node_modules/zeppelin-solidity/contracts/ownership/Claimable.sol";


contract ParetoNetworkToken is TokenInterface, StandardToken, HasNoEther, Claimable {
    function ParetoNetworkToken() public {
        totalSupply = uint256(500000000 * (10 ** decimals()));
        balances[msg.sender] = totalSupply;
    }

    function name() public constant returns (string) {
        return "Pareto Network Token";
    }

    function symbol() public constant returns (string) {
        return "PXT";
    }

    function decimals() public constant returns (uint256) {
        return uint256(18);
    }

    function isToken() public constant returns (bool) {
        return true;
    }
}
