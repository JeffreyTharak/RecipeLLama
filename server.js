// server.js
import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(".")); // serves index.html from same folder

app.post("/recipe", async (req, res) => {
  const { ingredients } = req.body;

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.2:3b", // smaller/faster model
        prompt: `Give me a recipe using: ${ingredients}. Include a title, ingredient list, and step-by-step instructions.`,
        options: {
          num_predict: 200
        }
      })
    });

    let recipe = "";

    // ✅ Stream parsing for Node.js
      for await (const chunk of response.body) {
      const text = chunk.toString("utf8");
      const lines = text.split("\n").filter(line => line.trim() !== "");

      for (const line of lines) {
        console.log("📥 Raw line:", line); // 👈 log raw Ollama output
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            recipe += parsed.response;
          }
        } catch (err) {
          console.error("❌ JSON parse error for line:", line);
        }
      }
    }

    console.log("🔎 Final Recipe:", recipe); // Debugging output
    res.json({ recipe: recipe.trim() });
  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ error: "Failed to get recipe" });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});