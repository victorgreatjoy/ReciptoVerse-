export type AdapterBlueprint = any;

// Provide a minimal placeholder object/class. If the runtime expects methods, implement them here.
export const AdapterBlueprint: AdapterBlueprint = {
  // example placeholder method; expand if you see runtime errors
  create: (...args: any[]) => {
    // return a generic adapter-like object
    return {
      name: "shim-adapter",
      init: async () => {},
      connect: async () => {},
      disconnect: async () => {},
      // add other methods your runtime complains about
    };
  },
};
