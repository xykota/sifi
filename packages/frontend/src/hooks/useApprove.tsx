import { useState } from 'react';
import { showToast } from '@sifi/shared-ui';
import { useMutation } from '@tanstack/react-query';
import { erc20ABI, usePublicClient, useWalletClient } from 'wagmi';
import { useWatch } from 'react-hook-form';
import { MAX_ALLOWANCE } from 'src/constants';
import { SwapFormKey } from 'src/providers/SwapFormProvider';
import { getEvmTxUrl, getTokenBySymbol } from 'src/utils';
import { useSelectedChain } from 'src/providers/SelectedChainProvider';
import { useQuote } from './useQuote';
import { useTokens } from './useTokens';

const useApprove = () => {
  const { selectedChain } = useSelectedChain();
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const publicClient = usePublicClient({ chainId: selectedChain.id });
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const { quote } = useQuote();
  const { tokens } = useTokens();
  const approveAddress = (quote?.permit2Address || quote?.approveAddress) as `0x${string}`;

  const [fromTokenSymbol] = useWatch({
    name: [SwapFormKey.FromToken],
  });

  const fromToken = getTokenBySymbol(fromTokenSymbol, tokens);

  const closeModal = () => {
    setIsApprovalModalOpen(false);
    setIsLoading(false);
  };

  const openModal = () => setIsApprovalModalOpen(true);

  const requestApproval = async (): Promise<void> => {
    if (!approveAddress) throw new Error('Approval address is missing');
    if (!fromToken) throw new Error('From token is missing');
    if (!walletClient) throw new Error('WalletClient not initialised, is the user connected?');

    setIsLoading(true);

    // TODO: Handle case when account already has allowance but it's not sufficient

    const hash = await walletClient.writeContract({
      chain: selectedChain,
      address: fromToken.address as `0x${string}`,
      abi: erc20ABI,
      functionName: 'approve',
      args: [approveAddress, BigInt(MAX_ALLOWANCE)],
    });

    setIsApprovalModalOpen(false);

    await publicClient.waitForTransactionReceipt({ hash });
    const explorerLink = getEvmTxUrl(selectedChain, hash);
    showToast({
      type: 'success',
      text: `Approved ${fromTokenSymbol} for trading`,
      link: { href: explorerLink || '', text: 'View Transaction' },
    });
    setIsLoading(false);
  };

  const mutation = useMutation(['requestApproval'], requestApproval, { retry: 0 });

  return { ...mutation, isApprovalModalOpen, closeModal, openModal, isLoading };
};

export { useApprove };
