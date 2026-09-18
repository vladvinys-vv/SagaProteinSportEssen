import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { ProductProvider } from "@/features/catalog/context/ProductContext";
import { CartProvider } from "@/features/cart/context/CartContext";
import HomePage from "@/pages/HomePage";

function renderHomePage() {
  return render(
    <BrowserRouter>
      <ProductProvider>
        <CartProvider>
          <HomePage />
        </CartProvider>
      </ProductProvider>
    </BrowserRouter>
  );
}

describe("HomePage", () => {
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
