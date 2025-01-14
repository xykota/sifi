import { useAccount, useNetwork } from 'wagmi';
import { parseUnits } from 'viem';
import { useCullQueries } from 'src/hooks/useCullQueries';
import { useAllowance } from 'src/hooks/useAllowance';
import { useApprove } from 'src/hooks/useApprove';
import { useTokens } from 'src/hooks/useTokens';
import { useQuote } from 'src/hooks/useQuote';
import { getTokenBySymbol, isValidTokenAmount } from 'src/utils';
import { ETH_CONTRACT_ADDRESS } from 'src/constants';
import { useTokenBalance } from 'src/hooks/useTokenBalance';
import { ApproveButton } from './ApproveButton';
import { SwitchNetworkButton } from './SwitchNetworkButton';
import { Button } from '../Button';
import { ConnectWallet } from '../ConnectWallet/ConnectWallet';
import { useSwapFormValues } from 'src/hooks/useSwapFormValues';

const CreateSwapButtons = ({ isLoading }: { isLoading: boolean }) => {
  useCullQueries('routes');
  useCullQueries('quote');
  const { isConnected } = useAccount();
  const { quote, isFetching: isFetchingQuote } = useQuote();
  const { chain } = useNetwork();
  const { fromTokens, toTokens } = useTokens();
  const { isLoading: isApproving } = useApprove();
  const { allowance, isAllowanceAboveFromAmount, isFetching: isFetchingAllowance } = useAllowance();
  const {
    fromToken: fromTokenSymbol,
    toToken: toTokenSymbol,
    fromAmount,
    fromChain,
    toChain,
  } = useSwapFormValues();
  const fromToken = getTokenBySymbol(fromTokenSymbol, fromTokens);
  const toToken = getTokenBySymbol(toTokenSymbol, toTokens);
  const isFromEthereum = fromToken?.address === ETH_CONTRACT_ADDRESS;
  const userIsConnectedToWrongNetwork = Boolean(
    chain?.id && fromToken?.chainId && chain.id !== fromToken.chainId
  );
  const { data: fromBalance } = useTokenBalance(fromToken, fromChain.id);
  const fromAmountInWei = fromToken ? parseUnits(fromAmount || '0', fromToken.decimals) : BigInt(0);
  const hasSufficientBalance = fromBalance && fromBalance.value >= fromAmountInWei;

  const isSwapButtonLoading = isLoading || isFetchingAllowance || isFetchingQuote;

  const showApproveButton =
    Boolean(
      !!quote &&
        allowance !== undefined &&
        !isAllowanceAboveFromAmount &&
        !isFromEthereum &&
        hasSufficientBalance
    ) || isApproving;

  const isSwapButtonDisabled =
    !isConnected ||
    showApproveButton ||
    !fromAmount ||
    !hasSufficientBalance ||
    !quote ||
    !isValidTokenAmount(fromAmount);

  const getSwapButtonLabel = () => {
    if (fromToken?.address === toToken?.address && fromChain?.id === toChain?.id) {
      return 'Cannot swap same tokens';
    }

    if (!fromAmount) return 'Enter an amount';

    if (!isValidTokenAmount(fromAmount)) return 'Enter a valid amount';

    const hasFetchedSwapQuote = !!quote || isFromEthereum;
    if (fromBalance && hasFetchedSwapQuote && !hasSufficientBalance) {
      return 'Insufficient Balance';
    }

    return 'Execute Swap';
  };

  if (!isConnected) return <ConnectWallet />;
  if (userIsConnectedToWrongNetwork) return <SwitchNetworkButton />;

  return (
    <>
      {showApproveButton ? (
        <ApproveButton />
      ) : (
        <Button isLoading={isSwapButtonLoading} disabled={isSwapButtonDisabled}>
          {getSwapButtonLabel()}
        </Button>
      )}
    </>
  );
};

export { CreateSwapButtons };
