import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import perfectionist from "eslint-plugin-perfectionist";
import prettier from "eslint-config-prettier";

export default tseslint.config(
    {
        ignores: ["coverage/**", "node_modules/**"],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            perfectionist,
        },

        rules: {
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    allowExpressions: true,
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/restrict-template-expressions": "off",
            "perfectionist/sort-enums": "warn",
            "perfectionist/sort-exports": "warn",
            "perfectionist/sort-imports": "warn",
            "perfectionist/sort-interfaces": [
                "warn",
                {
                    groups: ["required-property", "optional-property"],
                    order: "asc",
                },
            ],
            "perfectionist/sort-intersection-types": "warn",
            "perfectionist/sort-jsx-props": "warn",
            "perfectionist/sort-named-imports": "warn",
            "perfectionist/sort-object-types": [
                "warn",
                {
                    groups: ["required-property", "optional-property"],
                    order: "asc",
                },
            ],
            "perfectionist/sort-objects": [
                "warn",
                {
                    customGroups: [
                        {
                            elementNamePattern: "^try$",
                            groupName: "try",
                        },
                    ],
                    groups: ["try", "unknown"],
                    order: "asc",
                    type: "alphabetical",
                },
            ],
            "perfectionist/sort-union-types": [
                "warn",
                {
                    groups: [
                        "conditional",
                        "function",
                        "import",
                        "intersection",
                        "named",
                        "object",
                        "operator",
                        "literal",
                        "keyword",
                        "tuple",
                        "union",
                        "nullish",
                    ],
                    order: "asc",
                    type: "alphabetical",
                },
            ],
        },
        prettier,
    },
);
