const ETH_CONTRACT_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
const MIN_ALLOWANCE = '0xffffffffffffffffffffffffffffff';
const MAX_ALLOWANCE = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const POPULAR_TOKEN_SYMBOLS = ['ETH', 'USDT', 'XAI', 'USDC', 'WBTC', 'BUSD', 'DAI'];

// Standard ERC20 ABI for `balanceOf` function
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
    stateMutability: 'view',
  },
] as const;

// Based on various interactions with the Sifi Smart Contract
const SWAP_MAX_GAS_UNITS = 150000;

export {
  ETH_CONTRACT_ADDRESS,
  MIN_ALLOWANCE,
  MAX_ALLOWANCE,
  POPULAR_TOKEN_SYMBOLS,
  SWAP_MAX_GAS_UNITS,
  ERC20_ABI,
};
