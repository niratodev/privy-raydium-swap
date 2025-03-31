import { Raydium } from "@raydium-io/raydium-sdk-v2";
import type { Connection } from "@solana/web3.js";
import { getPublicKey } from "./getPublicKey";

let raydium: Raydium | null = null;

export const initializeRaydium = async (
  connection: Connection,
  walletAddress: string,
) => {
  if (raydium === null) {
    raydium = await Raydium.load({
      connection,
      owner: getPublicKey(walletAddress),
      disableLoadToken: true,
    });
  }
  return raydium;
};
