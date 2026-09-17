import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { CartProvider } from "@/features/cart";
import { ProductProvider } from "@/features/catalog";
import HomePage from "@/pages/HomePage";

describe("HomePage", () => {
  const renderHomePage = () =>
    render(
      <BrowserRouter>
        <ProductProvider>
          <CartProvider>
            <HomePage />
          </CartProvider>
        </ProductProvider>
      </BrowserRouter>,
    );

  it("renders hero title", () => {
    renderHomePage();

    expect(screen.getByText(/Natürliche Proteine/i)).toBeInTheDocument();
  });

  it("renders shop now button", () => {
    renderHomePage();

    expect(screen.getByText(/Jetzt shoppen/i)).toBeInTheDocument();
  });

  it("renders trust badges", () => {
    renderHomePage();

    expect(screen.getByText(/Kostenfreier Versand/i)).toBeInTheDocument();
  });
});
