import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import HomePage from "@/pages/HomePage";

describe("HomePage", () => {
  it("renders hero title", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Natürliche Proteine/i)).toBeInTheDocument();
  });

  it("renders shop now button", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Jetzt shoppen/i)).toBeInTheDocument();
  });

  it("renders trust badges", () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Kostenfreier Versand/i)).toBeInTheDocument();
  });
});
