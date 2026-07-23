import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../pages/AdminDashboard";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockVehicles = [
  {
    _id: "veh_1",
    make: "Tesla",
    model: "Model 3",
    category: "Sedan",
    price: 40000,
    quantity: 2,
    color: "White",
    images: [],
  },
];

describe("Admin Dashboard Component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.get.mockResolvedValue({ data: { vehicles: mockVehicles } });
  });

  it("should fetch and render vehicles list in admin management table", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/vehicles");
    });

    expect(screen.getByText("Tesla Model 3")).toBeInTheDocument();
    expect(screen.getByText("2 units")).toBeInTheDocument();
  });

  it("should submit new vehicle on create form submit (POST /api/vehicles)", async () => {
    const createdVehicle = {
      _id: "veh_2",
      make: "BMW",
      model: "M3",
      category: "Sports",
      price: 75000,
      quantity: 1,
      color: "Blue",
      images: [],
    };
    api.post.mockResolvedValueOnce({ data: { vehicle: createdVehicle } });

    render(<AdminDashboard />);

    const user = userEvent.setup();
    const addBtn = await screen.findByRole("button", { name: /add new vehicle/i });
    await user.click(addBtn);

    await user.type(screen.getByLabelText(/make/i), "BMW");
    await user.type(screen.getByLabelText(/model/i), "M3");
    await user.type(screen.getByLabelText(/category/i), "Sports");
    await user.type(screen.getByLabelText(/color/i), "Blue");
    await user.type(screen.getByLabelText(/price/i), "75000");
    await user.type(screen.getByLabelText(/initial quantity/i), "1");

    const submitBtn = screen.getByRole("button", { name: /add vehicle/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/vehicles", {
        make: "BMW",
        model: "M3",
        category: "Sports",
        color: "Blue",
        price: 75000,
        quantity: 1,
        images: [],
      });
    });

    expect(await screen.findByText("BMW M3")).toBeInTheDocument();
  });

  it("should update vehicle on edit form submit (PUT /api/vehicles/:id)", async () => {
    const updatedVehicle = { ...mockVehicles[0], price: 42000 };
    api.put.mockResolvedValueOnce({ data: { vehicle: updatedVehicle } });

    render(<AdminDashboard />);

    const user = userEvent.setup();
    const editBtn = await screen.findByRole("button", { name: /edit/i });
    await user.click(editBtn);

    const submitBtn = screen.getByRole("button", { name: /update vehicle/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith("/vehicles/veh_1", expect.any(Object));
    });
  });

  it("should delete vehicle on delete click (DELETE /api/vehicles/:id)", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    api.delete.mockResolvedValueOnce({ data: { message: "Vehicle deleted" } });

    render(<AdminDashboard />);

    const user = userEvent.setup();
    const deleteBtn = await screen.findByRole("button", { name: /delete/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith("/vehicles/veh_1");
    });
  });

  it("should restock vehicle on restock submit (POST /api/vehicles/:id/restock)", async () => {
    const restockedVehicle = { ...mockVehicles[0], quantity: 7 };
    api.post.mockResolvedValueOnce({ data: { vehicle: restockedVehicle } });

    render(<AdminDashboard />);

    const user = userEvent.setup();
    const restockInput = await screen.findByPlaceholderText(/\+ qty/i);
    await user.type(restockInput, "5");

    const restockBtn = screen.getByRole("button", { name: /^restock$/i });
    await user.click(restockBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/vehicles/veh_1/restock", { quantity: 5 });
    });

    expect(await screen.findByText("7 units")).toBeInTheDocument();
  });
});
