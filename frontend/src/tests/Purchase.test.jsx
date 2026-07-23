/**
 * STAGE 1 — FAILING TESTS ONLY
 * Purchase Vehicle Feature
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   1. VehicleCard does not render a Purchase button
 *   2. Disabled check when quantity === 0 is missing
 *   3. Click trigger connecting to POST /api/vehicles/:id/purchase is missing
 *   4. State update for reduced quantity and error handling are not implemented
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VehicleCard from "../components/VehicleCard";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockInStockVehicle = {
  _id: "veh_123",
  make: "Toyota",
  model: "Camry",
  category: "Sedan",
  price: 25000,
  quantity: 3,
  color: "Silver",
  images: [],
};

const mockOutOfStockVehicle = {
  _id: "veh_456",
  make: "Honda",
  model: "Civic",
  category: "Sedan",
  price: 22000,
  quantity: 0,
  color: "Blue",
  images: [],
};

describe("Purchase Vehicle Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render a disabled Purchase button when vehicle quantity is zero", () => {
    render(<VehicleCard vehicle={mockOutOfStockVehicle} />);

    const purchaseBtn = screen.getByRole("button", { name: /purchase|buy/i });
    expect(purchaseBtn).toBeInTheDocument();
    expect(purchaseBtn).toBeDisabled();
  });

  it("should render an enabled Purchase button when vehicle quantity is greater than zero", () => {
    render(<VehicleCard vehicle={mockInStockVehicle} />);

    const purchaseBtn = screen.getByRole("button", { name: /purchase|buy/i });
    expect(purchaseBtn).toBeInTheDocument();
    expect(purchaseBtn).not.toBeDisabled();
  });

  it("should call POST /api/vehicles/:id/purchase and update displayed quantity on successful purchase click", async () => {
    const updatedVehicle = { ...mockInStockVehicle, quantity: 2 };
    api.post.mockResolvedValueOnce({
      data: {
        message: "Vehicle purchased successfully",
        vehicle: updatedVehicle,
      },
    });

    const handleUpdate = vi.fn();
    render(<VehicleCard vehicle={mockInStockVehicle} onPurchaseSuccess={handleUpdate} />);

    const user = userEvent.setup();
    const purchaseBtn = screen.getByRole("button", { name: /purchase|buy/i });
    await user.click(purchaseBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/vehicles/veh_123/purchase");
    });

    expect(await screen.findByText(/2 in stock/i)).toBeInTheDocument();
  });

  it("should display error message when purchase API request fails", async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: { error: "Vehicle is out of stock" },
      },
    });

    render(<VehicleCard vehicle={mockInStockVehicle} />);

    const user = userEvent.setup();
    const purchaseBtn = screen.getByRole("button", { name: /purchase|buy/i });
    await user.click(purchaseBtn);

    expect(await screen.findByText(/vehicle is out of stock/i)).toBeInTheDocument();
  });
});
