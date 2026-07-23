import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Dashboard from "../pages/Dashboard";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockVehicles = [
  {
    _id: "1",
    make: "Tesla",
    model: "Model S",
    category: "Sedan",
    price: 89990,
    quantity: 3,
    color: "Red",
    images: ["https://example.com/models.jpg"],
  },
  {
    _id: "2",
    make: "Ford",
    model: "F-150",
    category: "Truck",
    price: 45000,
    quantity: 0,
    color: "Black",
    images: [],
  },
];

describe("Dashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display loading skeleton while fetching vehicles", () => {
    api.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<Dashboard />);

    expect(screen.getByTestId("loading-state")).toBeInTheDocument();
  });

  it("should fetch and render list of vehicle cards on success", async () => {
    api.get.mockResolvedValueOnce({ data: { vehicles: mockVehicles } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/vehicles");
    });

    expect(screen.getByText("Tesla Model S")).toBeInTheDocument();
    expect(screen.getByText("Ford F-150")).toBeInTheDocument();
    expect(screen.getByText("$89,990")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });

  it("should display empty state when API returns no vehicles", async () => {
    api.get.mockResolvedValueOnce({ data: { vehicles: [] } });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    expect(screen.getByText("No Vehicles Found")).toBeInTheDocument();
  });

  it("should display error message when API call fails", async () => {
    api.get.mockRejectedValueOnce({
      response: { data: { error: "Server connection failed" } },
    });
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText("Server connection failed")).toBeInTheDocument();
    });
  });
});
