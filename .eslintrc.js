module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ["airbnb-base", "plugin:jest/recommended", "plugin:prettier/recommended"],
  plugins: ["jest", "prettier"],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "prettier/prettier": "error",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "class-methods-use-this": "off",
    "no-param-reassign": "off",
    "no-underscore-dangle": "off",
    "import/no-extraneous-dependencies": ["error", { devDependencies: ["**/*.test.js", "**/*.spec.js"] }],
    "jest/expect-expect": "error",
    "jest/no-disabled-tests": "warn",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",
    "jest/valid-expect": "error",
  },
}
