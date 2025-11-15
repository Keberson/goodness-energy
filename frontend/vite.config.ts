import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@styles": path.resolve(__dirname, "./src/styles"),
            "@hooks": path.resolve(__dirname, "./src/hooks"),
            "@services": path.resolve(__dirname, "./src/services"),
            "@contexts": path.resolve(__dirname, "./src/contexts"),
            "@app-types": path.resolve(__dirname, "./src/types"),
            "@components": path.resolve(__dirname, "./src/common/components"),
        },
    },
});
