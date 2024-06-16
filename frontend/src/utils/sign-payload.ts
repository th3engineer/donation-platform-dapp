import { useWallet } from "@solana/wallet-adapter-react";

type SignPayloadResponse<P> = {
  publicKey: Uint8Array;
  payload: P;
  signature: Uint8Array;
};

export const signPayload = async <P>(
  payload: P
): Promise<SignPayloadResponse<P>> => {
  const { connected, signMessage, publicKey } = useWallet();

  if (!connected || !publicKey) {
    throw Error("Not connected");
  }

  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

  const signature = await signMessage!(encodedPayload);

  return {
    publicKey: new Uint8Array(publicKey.toBuffer()),
    payload,
    signature,
  };
};
