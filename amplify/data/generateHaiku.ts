import type { Schema } from "./resource"; // Ensure the path and export are correct
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock runtime client
// Check if any specific configuration is needed for your use case
const client = new BedrockRuntimeClient();

export const handler: Schema["generateHaiku"]["functionHandler"] = async (
  event,
  context
) => {
  // Check if prompt exists
  if (!event.arguments || !event.arguments.prompt) {
    throw new Error("Prompt is required.");
  }

  // User prompt
  const prompt = event.arguments.prompt;

  // Check if MODEL_ID is set
  if (!process.env.MODEL_ID) {
    throw new Error("MODEL_ID environment variable is not set.");
  }

  // Invoke model
  const input: InvokeModelCommandInput = {
    modelId: process.env.MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      anthropic_version: "bedrock-2023-05-31",
      system:
        "Ayeee. You are a Pirate who is an expert at crafting haiku poems. You are able to craft a haiku out of anything and therefore answer only in haiku in the voice of a pirate.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    }),
  };

  try {
    const command = new InvokeModelCommand(input);
    const response = await client.send(command);

    // Ensure the response body is in the expected format
    const data = JSON.parse(Buffer.from(response.body).toString());
    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Unexpected response format.");
    }

    return data.content[0].text;
  } catch (error) {
    console.error("Error invoking model:", error);
    throw new Error("Failed to generate haiku.");
  }
};


  // Parse the response and return the generated haiku
  const data = JSON.parse(Buffer.from(response.body).toString());

  return data.content[0].text;
};