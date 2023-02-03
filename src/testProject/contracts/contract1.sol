// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

contract NewContract {
  uint256 counter;

  /// increment the counter
  function increment() public {
    counter++;
  }

  /// decrement the counter
  function decrement() public {
    counter--;
  }
}