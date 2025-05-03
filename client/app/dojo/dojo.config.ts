import { createDojoConfig } from "@dojoengine/core";
import manifest from "./manifest_dev.json";

export const dojoConfig = createDojoConfig({
  manifest,
  rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
  toriiUrl: "https://api.cartridge.gg/x/stark-tic-tac-toe-odhack/torii",
});
