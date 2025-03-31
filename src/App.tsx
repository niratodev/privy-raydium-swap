import { useState } from "react";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import BN from "bn.js";
import { raydiumSwap } from "./utils/raydiumSwap";
import { poolId } from "./config";
import { useQuery } from "@tanstack/react-query";
import { getPublicKey } from "./utils/getPublicKey";

const amount = 0.001;
const amountIn = new BN(amount * LAMPORTS_PER_SOL);

export const App = () => {
  const [txnSignature, setTxnSignature] = useState("");
  const { login, authenticated, logout } = usePrivy();
  const { ready, wallets } = useSolanaWallets();
  const { connection } = useConnection();
  const [connectedWallet] = wallets;
  const isConnected = ready && authenticated && !!connectedWallet;

  const solBalanceQuery = useQuery({
    queryKey: ["sol-balance", connectedWallet?.address],
    queryFn: async () =>
      connection.getBalance(getPublicKey(connectedWallet.address)),
    enabled: isConnected,
  });

  const handleSwap = async () => {
    try {
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();
      const signature = await raydiumSwap({
        amountIn,
        poolId: poolId,
        connection,
        connectedWallet,
        inputMint: NATIVE_MINT.toBase58(),
        isDevnet: false,
        slippage: 1, // 1%
      });
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed",
      );
      setTxnSignature(signature);
    } catch (err) {
      console.error(err);
      setTxnSignature("");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "32px",
        gap: "32px",
      }}
    >
      <div>
        {(() => {
          if (isConnected) {
            return (
              <>
                <p style={{ marginBottom: "8px" }}>{connectedWallet.address}</p>
                <p style={{ marginBottom: "8px" }}>
                  {(() => {
                    if (solBalanceQuery.isLoading) {
                      return "Loading balance...";
                    }
                    if (solBalanceQuery.isSuccess) {
                      const balanceNum =
                        Number(solBalanceQuery.data) / LAMPORTS_PER_SOL;
                      return `${balanceNum.toFixed(3)} SOL`;
                    }
                    return null;
                  })()}
                </p>
                <button type="button" onClick={() => logout()}>
                  Disconnect
                </button>
              </>
            );
          }
          return (
            <button
              type="button"
              onClick={() => login()}
              disabled={!ready || authenticated}
            >
              Connect
            </button>
          );
        })()}
      </div>
      <div>
        <button
          type="button"
          onClick={handleSwap}
          disabled={!isConnected}
        >{`Swap ${amount} SOL for USDC`}</button>
      </div>
      <div>
        {txnSignature && (
          <a href={`https://solscan.io/tx/${txnSignature}`} target="_blank">
            {txnSignature}
          </a>
        )}
      </div>
    </div>
  );
};
