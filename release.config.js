const config = {
  branches: [
    "+([0-9])?(.{+([0-9]),x}).x",
    "main",
    {
      name: "next",
      prerelease: true,
    },
  ],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/github",
  ],
};

module.exports = config;
