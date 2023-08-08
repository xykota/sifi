import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();

  await deploy('SifiV1Router01', {
    from: deployer,
    args: [
      // Spender
      '0xF3f757b6a5110351AA1444c81ba256a505c39a31',
      // Fees
      '0xE9290C80b28db1B3d9853aB1EE60c6630B87F57E',
      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      // UniswapV2Router02
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    ],
    log: true,
    autoMine: true,
  });
};

export default func;

func.tags = ['SifiV1Router01'];
