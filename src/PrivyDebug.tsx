import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";

export const PrivyDebug = () => {
  const { ready, user } = usePrivy();
  const { ready: walletsReady, wallets } = useSolanaWallets();

  return (
    <div style={{ padding: ".5rem" }}>
      {ready && (
        <pre style={{ padding: ".5rem" }}>{JSON.stringify(user, null, 2)}</pre>
      )}
      {walletsReady && (
        <>
          <p>Connected Wallets</p>
          <pre style={{ padding: ".5rem" }}>
            {JSON.stringify(wallets, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
};
