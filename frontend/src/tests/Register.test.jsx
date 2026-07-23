/**
 * STAGE 1 — FAILING TESTS ONLY
 * Registration Page Component (src/pages/Register.jsx)
 *
 * WHY TESTS FAIL RIGHT NOW:
 *   1. Register component does not have interactive form fields for name, email, password
 *   2. Form validation for required fields is not implemented
 *   3. API call POST /api/auth/register is not connected
 *   4. Backend error display is missing
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Register from "../pages/Register";
import api from "../api/axios";

// Mock api instance
vi.mock("../api/axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

function renderRegister() {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
}

describe("Register Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render Name, Email, Password input fields and Register button", () => {
    renderRegister();

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register|create account/i })
    ).toBeInTheDocument();
  });

  it("should show validation errors when submitting empty required fields", async () => {
    renderRegister();

    const submitBtn = screen.getByRole("button", {
      name: /register|create account/i,
    });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("should call POST /api/auth/register with form data on valid submission", async () => {
    api.post.mockResolvedValueOnce({
      data: { message: "User registered successfully" },
    });

    renderRegister();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    const submitBtn = screen.getByRole("button", {
      name: /register|create account/i,
    });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
    });
  });

  it("should display backend error message when registration API call fails", async () => {
    api.post.mockRejectedValueOnce({
      response: {
        data: { error: "Email already registered" },
      },
    });

    renderRegister();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/name/i), "Jane Doe");
    await user.type(screen.getByLabelText(/email/i), "existing@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    const submitBtn = screen.getByRole("button", {
      name: /register|create account/i,
    });
    await user.click(submitBtn);

    expect(await screen.findByText(/email already registered/i)).toBeInTheDocument();
  });
});
