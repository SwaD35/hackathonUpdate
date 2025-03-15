const nextConfig = {
  env: {
    HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        ...config.externals,
        "onnxruntime-node": "commonjs onnxruntime-node",
      };
    }

    // Ignore binary files to avoid Webpack processing them
    config.module.rules.push({
      test: /\.node$/,
      use: "ignore-loader",
    });

    return config;
  },
};

export default nextConfig;
