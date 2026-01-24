{
  "jest": {
    "testEnvironment": "jsdom",
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/**/*.d.ts",
      "!src/mocks/**",
      "!src/**/*.stories.{js,jsx,ts,tsx}",
      "!src/index.tsx",
      "!src/reportWebVitals.ts",
      "!src/setupTests.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 95,
        "functions": 95,
        "lines": 95,
        "statements": 95
      }
    },
    "moduleNameMapper": {
      "\\.(css|less|scss|sass)$": "identity-obj-proxy"
    },
    "setupFilesAfterEnv": [
      "<rootDir>/src/setupTests.ts"
    ],
    "testMatch": [
      "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
      "<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}"
    ]
  },
  "babel": {
    "presets": [
      [
        "@babel/preset-env",
        {
          "targets": {
            "node": "current"
          }
        }
      ],
      [
        "@babel/preset-react",
        {
          "runtime": "automatic"
        }
      ],
      "@babel/preset-typescript"
    ]
  }
}