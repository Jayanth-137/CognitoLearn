const axios = require("axios");
const config = require("../config");

// POST /api/summarize — Generate summary from content
exports.generateSummary = async (req, res) => {
  try {
    const { content, type } = req.body;

    console.log("🔹 [Backend] Step 1: Received summarize request");
    console.log("🔹 [Backend] Content type:", type);
    console.log("🔹 [Backend] Content length:", content?.length);

    if (!content || content.trim().length === 0) {
      console.log("❌ [Backend] Step 2 Error: Empty content");
      return res.status(400).json({ error: "Content is required" });
    }

    // Validate content type
    if (!["text", "url"].includes(type)) {
      console.log("❌ [Backend] Step 2 Error: Invalid type");
      return res
        .status(400)
        .json({ error: 'Invalid content type. Must be "text" or "url"' });
    }

    console.log("✅ [Backend] Step 2: Validation passed");

    let textContent = content;

    // If type is URL, we could fetch the content here
    // For now, we'll just pass the URL or text as-is
    if (type === "url") {
      console.log("🔹 [Backend] Step 3: Processing URL");
      textContent = content;
    }

    // Call Python service to generate summary
    console.log(
      "📡 [Backend] Step 4: Calling Python AI service at",
      config.aiServiceUrl,
    );
    const aiResponse = await axios.post(
      `${config.aiServiceUrl}/summarize`,
      {
        content: textContent,
      },
      { timeout: 60000 },
    );

    console.log("📥 [Backend] Step 5: Received AI response");
    console.log("🔹 [Backend] AI Response data:", aiResponse.data);

    if (!aiResponse.data.success || !aiResponse.data.summary) {
      console.log("❌ [Backend] Step 6 Error: Invalid AI response");
      throw new Error("Invalid AI response");
    }

    console.log("✅ [Backend] Step 6: Summary processed successfully");
    return res.json({
      success: true,
      summary: aiResponse.data.summary,
      type,
      contentLength: textContent.length,
    });
  } catch (error) {
    console.error("❌ [Backend] Summarize Error:", error.message);
    console.error("Error details:", error);

    if (error.response?.status === 400) {
      return res
        .status(400)
        .json({ error: error.response.data.error || "Bad request" });
    }

    if (error.code === "ECONNREFUSED") {
      console.error("❌ [Backend] AI service unavailable");
      return res.status(503).json({ error: "AI service unavailable" });
    }

    res
      .status(500)
      .json({ error: "Failed to generate summary. Please try again." });
  }
};
