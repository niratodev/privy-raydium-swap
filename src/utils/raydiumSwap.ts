import type { ConnectedSolanaWallet } from "@privy-io/react-auth";
import {
  CurveCalculator,
  type ApiV3PoolInfoStandardItemCpmm,
  type CpmmKeys,
  type CpmmRpcData,
  type Raydium,
  type TxVersion,
} from "@raydium-io/raydium-sdk-v2";
import type { Connection } from "@solana/web3.js";
import type BN from "bn.js";
import { getPublicKey } from "./getPublicKey";
import { initializeRaydium } from "./initializeRaydiumSdk";

type SwapInfoArgs = {
  raydium: Raydium;
  poolId: string;
  isDevnet: boolean;
};

/**
 * @see https://github.com/raydium-io/raydium-sdk-V2-demo/blob/master/src/cpmm/swap.ts#L22
 */
const getSwapInfo = async ({
  raydium,
  poolId,
  isDevnet,
}: SwapInfoArgs): Promise<{
  poolInfo: ApiV3PoolInfoStandardItemCpmm;
  poolKeys?: CpmmKeys;
  rpcData: CpmmRpcData;
}> => {
  if (isDevnet) {
    const data = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    return data;
  }

  const [pools, rpcData] = await Promise.all([
    raydium.api.fetchPoolById({ ids: poolId }),
    raydium.cpmm.getRpcPoolInfo(poolId, true),
  ]);
  const [poolInfo] = pools as ApiV3PoolInfoStandardItemCpmm[];
  return { poolInfo, rpcData };
};

type RaydiumSwapArgs = {
  amountIn: BN;
  poolId: string;
  inputMint: string;
  slippage: number;
  connection: Connection;
  connectedWallet: ConnectedSolanaWallet;
  isDevnet?: boolean;
};

export const raydiumSwap = async ({
  amountIn,
  poolId,
  inputMint,
  slippage,
  connection,
  connectedWallet,
  isDevnet = false,
}: RaydiumSwapArgs): Promise<string> => {
  const raydium = await initializeRaydium(connection, connectedWallet.address);
  const { poolInfo, poolKeys, rpcData } = await getSwapInfo({
    raydium,
    poolId,
    isDevnet,
  });

  const baseIn = inputMint === poolInfo.mintA.address;
  const swapResult = CurveCalculator.swap(
    amountIn,
    baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
    baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
    rpcData.configInfo!.tradeFeeRate,
  );

  const { blockhash } = await connection.getLatestBlockhash();
  const { transaction } = await raydium.cpmm.swap<TxVersion.LEGACY>({
    poolInfo,
    poolKeys,
    inputAmount: amountIn,
    swapResult,
    slippage: slippage / 100,
    baseIn,
  });
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = getPublicKey(connectedWallet.address);

  const txn = await connectedWallet.sendTransaction(transaction, connection);
  return txn;
};
