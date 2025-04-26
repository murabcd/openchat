import { experimental_generateImage } from "ai";
import { myProvider } from "@/lib/ai/models";
import { createDocumentHandler } from "@/lib/blocks/server";

import { fetchAction } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export const imageDocumentHandler = createDocumentHandler<"image">({
  kind: "image",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    try {
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel("image-model-large"),
        prompt: title,
        n: 1,
      });

      draftContent = image.base64;

      dataStream.writeData({
        type: "image-delta",
        content: image.base64,
      });

      try {
        const result = await fetchAction(api.files.storeAiImage, {
          base64Image: image.base64,
        });
        return JSON.stringify(result);
      } catch (error) {
        return draftContent;
      }
    } catch (error) {
      console.error("Error in image generation:", error);
      throw error;
    }
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = "";

    try {
      const { image } = await experimental_generateImage({
        model: myProvider.imageModel("image-model-large"),
        prompt: description,
        n: 1,
      });

      draftContent = image.base64;

      dataStream.writeData({
        type: "image-delta",
        content: image.base64,
      });

      try {
        const result = await fetchAction(api.files.storeAiImage, {
          base64Image: image.base64,
        });
        return JSON.stringify(result);
      } catch (error) {
        return draftContent;
      }
    } catch (error) {
      console.error("Error in image generation:", error);
      throw error;
    }
  },
});
