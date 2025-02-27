import type { Token } from '@sifi/sdk';
import type { BaseError } from 'viem';

type MulticallToken = Omit<Token, 'address'> & { address: `0x${string}` };
type BalanceMap = Map<`0x${string}`, { balance: string; usdValue?: string | null }>;

type ViemError = Error | (Error & BaseError);

export type { MulticallToken, BalanceMap, ViemError };
