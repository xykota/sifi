// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {PermitParams} from '../libraries/PermitParams.sol';
import {ILibStarVault} from '../interfaces/ILibStarVault.sol';
import {ILibWarp} from '../interfaces/ILibWarp.sol';

interface IUniV2Like is ILibStarVault, ILibWarp {
  error InsufficienTokensDelivered();
  error DeadlineExpired();
  error InsufficientOutputAmount();
  error EthTransferFailed();
  error IncorrectEthValue();

  struct ExactInputParams {
    uint256 amountIn;
    uint256 amountOut;
    uint16[] poolFeesBps;
    address recipient;
    uint16 slippageBps;
    uint16 feeBps;
    uint48 deadline;
    address partner;
    address[] tokens;
    address[] pools;
  }

  struct ExactInputSingleParams {
    uint256 amountIn;
    uint256 amountOut;
    address recipient;
    address pool;
    uint16 feeBps;
    uint16 slippageBps;
    address partner;
    address tokenIn;
    address tokenOut;
    uint16 poolFeeBps;
    uint48 deadline;
  }

  function uniswapV2LikeExactInputSingle(
    ExactInputSingleParams memory params
  ) external payable returns (uint256 amountOut);

  function uniswapV2LikeExactInput(
    ExactInputParams memory params
  ) external payable returns (uint256 amountOut);

  function uniswapV2LikeExactInputSinglePermit(
    ExactInputSingleParams memory params,
    PermitParams calldata permit
  ) external returns (uint256 amountOut);

  function uniswapV2LikeExactInputPermit(
    ExactInputParams memory params,
    PermitParams calldata permit
  ) external returns (uint256 amountOut);
}
