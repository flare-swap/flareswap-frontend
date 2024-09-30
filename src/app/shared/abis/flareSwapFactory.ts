export const flareSwapFactoryABI: any = [
  { type: "constructor", stateMutability: "nonpayable", inputs: [] },
  {
    type: "event",
    name: "FeeAmountEnabled",
    inputs: [
      { type: "uint24", name: "fee", internalType: "uint24", indexed: true },
      { type: "int24", name: "tickSpacing", internalType: "int24", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "OwnerChanged",
    inputs: [
      { type: "address", name: "oldOwner", internalType: "address", indexed: true },
      { type: "address", name: "newOwner", internalType: "address", indexed: true },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "PoolCreated",
    inputs: [
      { type: "address", name: "token0", internalType: "address", indexed: true },
      { type: "address", name: "token1", internalType: "address", indexed: true },
      { type: "uint24", name: "fee", internalType: "uint24", indexed: true },
      { type: "int24", name: "tickSpacing", internalType: "int24", indexed: false },
      { type: "address", name: "pool", internalType: "address", indexed: false },
    ],
    anonymous: false,
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [{ type: "address", name: "pool", internalType: "address" }],
    name: "createPool",
    inputs: [
      { type: "address", name: "tokenA", internalType: "address" },
      { type: "address", name: "tokenB", internalType: "address" },
      { type: "uint24", name: "fee", internalType: "uint24" },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "enableFeeAmount",
    inputs: [
      { type: "uint24", name: "fee", internalType: "uint24" },
      { type: "int24", name: "tickSpacing", internalType: "int24" },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "int24", name: "", internalType: "int24" }],
    name: "feeAmountTickSpacing",
    inputs: [{ type: "uint24", name: "", internalType: "uint24" }],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "address", name: "", internalType: "address" }],
    name: "getPool",
    inputs: [
      { type: "address", name: "", internalType: "address" },
      { type: "address", name: "", internalType: "address" },
      { type: "uint24", name: "", internalType: "uint24" },
    ],
  },
  { type: "function", stateMutability: "view", outputs: [{ type: "address", name: "", internalType: "address" }], name: "owner", inputs: [] },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      { type: "address", name: "factory", internalType: "address" },
      { type: "address", name: "token0", internalType: "address" },
      { type: "address", name: "token1", internalType: "address" },
      { type: "uint24", name: "fee", internalType: "uint24" },
      { type: "int24", name: "tickSpacing", internalType: "int24" },
    ],
    name: "parameters",
    inputs: [],
  },
  { type: "function", stateMutability: "nonpayable", outputs: [], name: "setOwner", inputs: [{ type: "address", name: "_owner", internalType: "address" }] },
];
