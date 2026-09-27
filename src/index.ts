import express from "express";
import type { Request, Response } from "express";

const app = express();
const PORT = 3000;

app.use(express.json());

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  location: string;
};

let inventory: InventoryItem[] = [
  {
    id: 1,
    name: "Digital Multimeter",
    category: "Electrical",
    quantity: 12,
    unitPrice: 1500,
    location: "Shelf A1",
  },
  {
    id: 2,
    name: "Vernier Caliper",
    category: "Measurement",
    quantity: 8,
    unitPrice: 850,
    location: "Shelf A2",
  },
  {
    id: 3,
    name: "Safety Helmet",
    category: "Safety",
    quantity: 25,
    unitPrice: 350,
    location: "Shelf B1",
  },
  {
    id: 4,
    name: "Electric Drill",
    category: "Power Tools",
    quantity: 6,
    unitPrice: 3200,
    location: "Shelf C1",
  },
  {
    id: 5,
    name: "Adjustable Wrench",
    category: "Hand Tools",
    quantity: 15,
    unitPrice: 420,
    location: "Shelf C2",
  },
];

// Home
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Engineering Inventory API is running",
  });
});

// GET all inventory + filtering/searching
app.get("/inventory", (req: Request, res: Response) => {
  const category = req.query.category;
  const search = req.query.search;
  const minQuantity = req.query.minQuantity;

  let result = inventory;

  if (category !== undefined) {
    if (typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        message: "Invalid category",
      });
    }

    result = result.filter(
      (item) =>
        item.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (search !== undefined) {
    if (typeof search !== "string" || search.trim() === "") {
      return res.status(400).json({
        message: "Invalid search value",
      });
    }

    const keyword = search.toLowerCase();

    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.category.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword)
    );
  }

  if (minQuantity !== undefined) {
    if (
      typeof minQuantity !== "string" ||
      minQuantity.trim() === "" ||
      isNaN(Number(minQuantity)) ||
      Number(minQuantity) < 0
    ) {
      return res.status(400).json({
        message: "minQuantity must be a non-negative number",
      });
    }

    result = result.filter(
      (item) => item.quantity >= Number(minQuantity)
    );
  }

  res.status(200).json(result);
});

// GET inventory by ID
app.get("/inventory/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid inventory ID",
    });
  }

  const item = inventory.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({
      message: "Inventory item not found",
    });
  }

  res.status(200).json(item);
});

// POST create new inventory item
app.post("/inventory", (req: Request, res: Response) => {
  const { name, category, quantity, unitPrice, location } = req.body;

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof category !== "string" ||
    category.trim() === "" ||
    !Number.isInteger(quantity) ||
    quantity < 0 ||
    typeof unitPrice !== "number" ||
    unitPrice < 0 ||
    typeof location !== "string" ||
    location.trim() === ""
  ) {
    return res.status(400).json({
      message: "Invalid inventory data",
    });
  }

  const newItem: InventoryItem = {
    id:
      inventory.length > 0
        ? Math.max(...inventory.map((item) => item.id)) + 1
        : 1,
    name: name.trim(),
    category: category.trim(),
    quantity,
    unitPrice,
    location: location.trim(),
  };

  inventory.push(newItem);

  res.status(201).json(newItem);
});

// PATCH update inventory item
app.patch("/inventory/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid inventory ID",
    });
  }

  const item = inventory.find((item) => item.id === id);

  if (!item) {
    return res.status(404).json({
      message: "Inventory item not found",
    });
  }

  const { name, category, quantity, unitPrice, location } = req.body;

  if (
    name === undefined &&
    category === undefined &&
    quantity === undefined &&
    unitPrice === undefined &&
    location === undefined
  ) {
    return res.status(400).json({
      message: "At least one field is required",
    });
  }

  if (
    (name !== undefined &&
      (typeof name !== "string" || name.trim() === "")) ||
    (category !== undefined &&
      (typeof category !== "string" || category.trim() === "")) ||
    (quantity !== undefined &&
      (!Number.isInteger(quantity) || quantity < 0)) ||
    (unitPrice !== undefined &&
      (typeof unitPrice !== "number" || unitPrice < 0)) ||
    (location !== undefined &&
      (typeof location !== "string" || location.trim() === ""))
  ) {
    return res.status(400).json({
      message: "Invalid inventory data",
    });
  }

  if (name !== undefined) {
    item.name = name.trim();
  }

  if (category !== undefined) {
    item.category = category.trim();
  }

  if (quantity !== undefined) {
    item.quantity = quantity;
  }

  if (unitPrice !== undefined) {
    item.unitPrice = unitPrice;
  }

  if (location !== undefined) {
    item.location = location.trim();
  }

  res.status(200).json(item);
});

// DELETE inventory item
app.delete("/inventory/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid inventory ID",
    });
  }

  const index = inventory.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Inventory item not found",
    });
  }

  inventory.splice(index, 1);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});