import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    "hotel-images": { access: "public_read" },
  },
});
