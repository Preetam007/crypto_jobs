pragma solidity  ^0.4.21;
import "./SafeMath.sol";

contract TravelHelperToken {
    function transfer (address, uint) public pure { }
    // function finalize() public pure { }
    // function transferOwnership (address) public pure { }
}

contract DropContract {
    using SafeMath for uint256;

    // The token being sold
    TravelHelperToken public token;

    function DropContract(TravelHelperToken _token) public { 
      require(_token != address(0));
    }

}    