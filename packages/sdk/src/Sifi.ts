import { serializeJson } from './helpers';

// From @uniswap/token-lists/dist/types.d.ts
export type Token = {
  chainId: number;
  address: string;
  name: string;
  decimals: number;
  symbol: string;
  logoURI?: string;
};
export type GetQuoteOptions = {
  /**
   * The Chain ID of the chain to swap from. Defaults to 1 (Ethereum mainnet).
   */
  fromChain?: number;
  fromToken: string;
  /**
   * The Chain ID of the chain to swap to. Defaults to `fromChain`.
   */
  toChain?: number;
  toToken: string;
  fromAmount: bigint | string;
};

export type Quote = {
  fromAmount: bigint;
  fromToken: Token;
  toToken: Token;
  toAmount: bigint;
  estimatedGas: bigint;
  /**
   * The address of the Permit2 contract to use, or undefined if not using Permit2 or if moving the native token.
   */
  permit2Address?: string;
  /**
   * The address to approve for moving tokens, or undefined if moving the native token
   *
   * When `permit2Address` is set, this is the spender to use for the permit.
   * Else, this is the spender to use for the ERC20 approve.
   */
  approveAddress?: string;
  toAmountAfterFeesUsd: string;
  source: {
    name: string;
    data: unknown;
  };
};

export type GetSwapOptions = {
  /**
   * Quote object from `getQuote`
   */
  quote: Quote;
  /**
   * Address of the token to swap from.
   */
  fromAddress: string;
  /**
   * Slippage as fraction of 1 (e.g. 0.005 for 0.5%)
   */
  slippage?: number;
  /**
   * Recipient of swapped tokens. Defaults to `fromAddress`.
   */
  toAddress?: string;
  /**
   * Partner address (0xdeadbeef...)
   */
  partner?: string;
  /**
   * Fee in basis points (e.g. 25 for 0.25%). The fee is split evenly between the partner
   * and SIFI. Defaults to 0, meaning no fee is charged.
   */
  feeBps?: number;
  /**
   * The permit to use to transfer the tokens
   *
   * When `permit2Address` is set on the quote, this field is required
   *
   * See https://blog.uniswap.org/permit2-integration-guide for more information
   */
  permit?: {
    nonce: number | bigint;
    deadline: number | bigint;
    signature: string;
  };
};

export type Swap = {
  tx: {
    /**
     * Address with checksum
     */
    from: string;
    /**
     * Address with checksum
     */
    to: string;
    /**
     * Value as hex string, e.g. `0x0` when swapping from the native token
     */
    value?: string;
    /**
     * Data as hex string, e.g. `0xdeadbeef`
     */
    data: string;
    /**
     * Chain ID as number, e.g. `1` for Ethereum mainnet
     */
    chainId: number;
    /**
     * Gas price as hex string, e.g. `0x030d40`
     */
    gasLimit: string;
  };
  estimatedGasTotalUsd: string;
};

export type GetTokensOptions = {
  chainId: number;
};

export type TokenUsdPrice = {
  usdPrice: string;
};

export type JumpStatus = 'pending' | 'inflight' | 'success' | 'unknown';

export type Jump = {
  status: JumpStatus;
  txhash?: string;
};

export class SifiError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SifiError';
  }
}

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  if (response.ok) {
    if (!contentType?.startsWith('application/json')) {
      throw new SifiError(`Unexpected response content type: ${contentType ?? '<none>'}`);
    }

    return await response.json();
  }

  if (contentType?.startsWith('application/json')) {
    const json = (await response.json()) as { code: string; message: string };

    throw new SifiError(json.message, json.code);
  }

  throw new SifiError(`Request failed: ${response.statusText}`);
}

/**
 * Placeholder address used to represent the native token.
 */
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export class Sifi {
  constructor(private readonly baseUrl = 'https://api.sifi.org/v1/') {}

  async getQuote(options: GetQuoteOptions): Promise<Quote> {
    const params: Record<string, string> = {
      fromToken: options.fromToken,
      toToken: options.toToken,
      fromAmount: options.fromAmount.toString(),
    };

    if (options.fromChain !== undefined) {
      params.fromChain = options.fromChain.toString();
    }

    if (options.toChain !== undefined) {
      params.toChain = options.toChain.toString();
    }

    const query = new URLSearchParams(params).toString();

    const response = (await fetch(`${this.baseUrl}quote?${query}`).then(handleResponse)) as any;

    return {
      fromAmount: BigInt(response.fromAmount),
      fromToken: response.fromToken,
      toToken: response.toToken,
      toAmount: BigInt(response.toAmount),
      estimatedGas: BigInt(response.estimatedGas),
      approveAddress: response.approveAddress,
      permit2Address: response.permit2Address,
      toAmountAfterFeesUsd: response.toAmountAfterFeesUsd,
      source: response.source,
    };
  }

  async getSwap(options: GetSwapOptions): Promise<Swap> {
    const response = (await fetch(`${this.baseUrl}swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serializeJson(options),
    }).then(handleResponse)) as any;
    return {
      tx: response.tx,
      estimatedGasTotalUsd: response.estimatedGasTotalUsd,
    };
  }

  async getToken(chainId: number, address: string): Promise<Token> {
    const query = new URLSearchParams({
      chainId: chainId.toString(),
      address,
    });

    const response = await fetch(`${this.baseUrl}token?${query}`).then(handleResponse);

    return response;
  }

  async getTokens(options: number | GetTokensOptions): Promise<Token[]> {
    if (typeof options === 'number') {
      options = { chainId: options };
    }

    const query = new URLSearchParams({
      chainId: options.chainId.toString(),
    }).toString();

    const response = await fetch(`${this.baseUrl}tokens?${query}`).then(handleResponse);

    return response;
  }

  async getUsdPrice(chainId: number, address: string): Promise<TokenUsdPrice> {
    const query = new URLSearchParams({
      chainId: chainId.toString(),
      address,
    });

    const response = await fetch(`${this.baseUrl}token/usd-price?${query}`).then(handleResponse);

    return response;
  }

  async getJump(txhash: string): Promise<Jump> {
    const query = new URLSearchParams({
      txhash,
    });

    const response = await fetch(`${this.baseUrl}jump?${query}`).then(handleResponse);

    return response;
  }
}
