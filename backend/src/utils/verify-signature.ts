import nacl from "tweetnacl";

export type SignedPayload<P> = {
  publicKey: Uint8Array;
  payload: P;
  signature: Uint8Array;
};

type VerifySignatureResponse<P> = { isValid: boolean; payload: P };

export const verifyPayload = <P>({
  publicKey,
  payload,
  signature,
}: SignedPayload<P>): VerifySignatureResponse<P> => {
  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));

  const isValid = nacl.sign.detached.verify(
    encodedPayload,
    signature,
    publicKey
  );

  return {
    isValid,
    payload,
  };
};
