// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

contract Vault1 {
  uint256 counter;
  address owner;

  modifier onlyOwner {
    require(msg.sender == owner, "Only owner can call this function.");
    _;
  }

  /// increment the counter
  function increment() public {
    counter++;
  }

  /// decrement the counter
  function decrement() public {
    counter--;
  }
}