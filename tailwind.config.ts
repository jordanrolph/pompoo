import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: [...fontFamily.sans],
      },
      colors: {
        // gold: {
        //   50: "#fff",
        // },
      },
    },
  },
  plugins: [],
} satisfies Config;
