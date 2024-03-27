// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PAWA is ERC20Burnable, Ownable {
    uint256 private constant INITIAL_SUPPLY = 21000 * 1e18;

    constructor() ERC20("PAWA", "PAWA") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
