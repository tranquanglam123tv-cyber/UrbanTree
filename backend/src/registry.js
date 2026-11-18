// backend/src/registry.js
const express = require("express");
const blockchainClient = require("./services/blockchainClient");
const router = express.Router();

// ------------------- POST /record -------------------
router.post("/record", async (req, res) => {
    const { recordId, recordType, dataHash } = req.body;
    try {
        const result = await blockchainClient.anchor(recordId, recordType, dataHash);
        res.json({ status: "ok", txHash: result.txHash, blockNumber: result.blockNumber });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// ------------------- GET /record/:id -------------------
router.get("/record/:id", async (req, res) => {
    try {
        const rec = await blockchainClient.getRecord(req.params.id);
        if (!rec.exists) {
            return res.status(404).json({ error: "Record not found on blockchain" });
        }
        res.json(rec);
    } catch (e) {
        res.status(404).json({ error: e.message });
    }
});

// ------------------- GET /verify/:id -------------------
router.get("/verify/:id", async (req, res) => {
    const { currentHash } = req.query;
    try {
        const result = await blockchainClient.verify(req.params.id, currentHash);
        res.json({
            isValid: result.isValid,
            isExisted: result.isExisted,
            timestamp: result.timestamp,
            recorder: result.recorder,
            dataHash: result.storedHash
        });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

module.exports = router;
