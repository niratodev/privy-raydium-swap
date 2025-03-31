import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

import { App } from "./App.tsx";
import { rpcUrl, privyAppId } from "./config.ts";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PrivyProvider
      appId={privyAppId}
      config={{
        loginMethods: ["wallet", "twitter"],
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors(),
          },
        },
        embeddedWallets: { createOnLogin: "users-without-wallets" },
        solanaClusters: [{ name: "mainnet-beta", rpcUrl: rpcUrl }],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={rpcUrl}>
          <App />
        </ConnectionProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </StrictMode>,
);
