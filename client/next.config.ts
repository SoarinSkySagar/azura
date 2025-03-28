import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config: Configuration, { isServer }) => {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };
 
    if (isServer) {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
    
      config.module.rules.push({
        test: /\.wasm$/,
        type: "javascript/auto",
        use: "null-loader",
      });
    }
    

    return config;
  },
};

export default nextConfig;
