"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { type State, WagmiProvider } from "wagmi";

import { ModalProvider } from "./shared/contexts/ModalContext";
import { getConfig } from "./shared/constants/wagmi-config";

type Props = {
  children: ReactNode;
  initialState: State | undefined;
};

const queryClient = new QueryClient()

export function Providers({ children, initialState }: Props) {

  return (
    <WagmiProvider config={getConfig()} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>{children}</ModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
