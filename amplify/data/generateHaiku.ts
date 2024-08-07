import type { Schema } from "./resource";
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandInput,
} from "@aws-sdk/client-bedrock-runtime";

// Initialize Bedrock runtime client
const client = new BedrockRuntimeClient();

export const handler: Schema["generateHaiku"]["functionHandler"] = async (
  event,
  context
) => {
  // User prompt
  const prompt = event.arguments.prompt;

  // Ensure prompt is not empty
  if (!prompt) {
    throw new Error("Prompt is required.");
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

    // Parse the response and return the generated haiku
    const data = JSON.parse(Buffer.from(response.body).toString());

    if (!data.content || !data.content[0] || !data.content[0].text) {
      throw new Error("Unexpected response format.");
    }

    return data.content[0].text;
  } catch (error) {
    console.error("Error invoking model:", error);
    throw new Error("Failed to generate haiku.");
  }
}; // Ensure this closing brace correctly matches the async function
