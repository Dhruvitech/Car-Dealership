/**
 * STAGE 1 — FAILING TESTS ONLY
 * Vehicle Search Feature
 *
 * WHY EVERY TEST FAILS RIGHT NOW:
 *   1. Search filter form controls (make, model, category, minPrice, maxPrice) are not rendered on Dashboard
 *   2. Submit trigger and query parameter construction for GET /api/vehicles/search are missing
 *   3. Search results handling state is not connected to the vehicle grid
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dashboard from "../pages/Dashboard";
import api from "../api/axios";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockSearchResults = [
  {
    _id: "veh_1",
    make: "Toyota",
    model: "Camry",
    category: "Sedan",
    price: 25000,
    quantity: 5,
    color: "Silver",
    images: [],
  },
];

describe("Vehicle Search Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { vehicles: [] } });
  });

  it("should render all search input fields (Make, Model, Category, Min Price, Max Price) and Search button", () => {
    render(<Dashboard />);

    expect(screen.getByPlaceholderText(/search make/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search model/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/category/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max price/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /search|filter/i })
    ).toBeInTheDocument();
  });

  it("should call GET /api/vehicles/search with query parameters on search submit", async () => {
    api.get.mockResolvedValueOnce({ data: { vehicles: mockSearchResults } });

    render(<Dashboard />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/search make/i), "Toyota");
    await user.type(screen.getByPlaceholderText(/search model/i), "Camry");
    await user.type(screen.getByPlaceholderText(/category/i), "Sedan");
    await user.type(screen.getByPlaceholderText(/min price/i), "10000");
    await user.type(screen.getByPlaceholderText(/max price/i), "30000");

    const searchBtn = screen.getByRole("button", { name: /search|filter/i });
    await user.click(searchBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/vehicles/search", {
        params: {
          make: "Toyota",
          model: "Camry",
          category: "Sedan",
          minPrice: "10000",
          maxPrice: "30000",
        },
      });
    });
  });

  it("should display search results returned from GET /api/vehicles/search", async () => {
    api.get.mockResolvedValueOnce({ data: { vehicles: mockSearchResults } });

    render(<Dashboard />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/search make/i), "Toyota");

    const searchBtn = screen.getByRole("button", { name: /search|filter/i });
    await user.click(searchBtn);

    expect(await screen.findByText("Toyota Camry")).toBeInTheDocument();
    expect(screen.getByText("$25,000")).toBeInTheDocument();
  });

  it("should display empty state message when search returns no matching vehicles", async () => {
    api.get.mockResolvedValueOnce({ data: { vehicles: [] } });

    render(<Dashboard />);

    const user = userEvent.setup();
    await user.type(screen.getByPlaceholderText(/search make/i), "NonExistentBrand");

    const searchBtn = screen.getByRole("button", { name: /search|filter/i });
    await user.click(searchBtn);

    expect(await screen.findByText(/no vehicles match your search/i)).toBeInTheDocument();
  });
});
