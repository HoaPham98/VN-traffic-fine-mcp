import express, { type Request, type Response } from "express";
import { lookup, type VehicleType } from "./src/phatnguoi.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api", async (req: Request, res: Response) => {
  const licensePlate = req.query.licensePlate as string | undefined;
  const type = (req.query.type as string | undefined) as VehicleType ?? "1";

  if (!licensePlate) {
    return res.status(400).json({ error: "licensePlate is required" });
  }

  const { violations } = await lookup(licensePlate, type);
  if (violations === null) {
    return res.status(500).json({ error: "Failed to fetch violations" });
  }

  return res.json({ licensePlate, type, violations });
});

app.post("/api/lookup", async (req: Request, res: Response) => {
  const { plate, type = "1" } = req.body as { plate?: string; type?: VehicleType };

  if (!plate) {
    return res.status(400).json({ error: "plate is required" });
  }

  const { violations } = await lookup(plate, type as VehicleType);
  if (violations === null) {
    return res.status(500).json({ error: "Failed to fetch violations" });
  }

  return res.json({ plate, type, violations });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
