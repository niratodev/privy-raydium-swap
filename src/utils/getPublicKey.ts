import { PublicKey } from "@solana/web3.js";

export const getPublicKey = (address: string | PublicKey) => {
  if (typeof address === "string") {
    return new PublicKey(address);
  }
  return address;
};
