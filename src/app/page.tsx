
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Eye,
  Heart,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  brand: string | null;
  category: string;
  imageUrl: string | null;
  stock: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type FulfillmentMethod = "DELIVERY" | "PICKUP";

const API_URL = "http://localhost:3001/products";
const BACKEND_URL = "http://localhost:3001";
const ORDERS_API_URL = "http://localhost:3001/orders";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Shopping cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Checkout information
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("DELIVERY");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [orderError, setOrderError] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch {
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      category === "All" || product.category === category;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  const cartTotal = cart.reduce(
    (total, item) =>
      total + Number(item.product.price) * item.quantity,
    0,
  );

  function getProductImageUrl(imageUrl: string | null) {
    if (!imageUrl) {
      return "/placeholder.png";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${BACKEND_URL}${imageUrl}`;
  }

  // Add a product to the cart
  function addToCart(product: Product) {
    if (product.stock <= 0) {
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.product.id === product.id,
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          return currentCart;
        }

        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, product }
            : item,
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });

    setOrderMessage("");
    setOrderError(false);
  }

  // Change product quantity
  function updateCartQuantity(productId: number, change: number) {
    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.product.id !== productId) {
            return item;
          }

          const newQuantity = item.quantity + change;

          if (newQuantity <= 0) {
            return null;
          }

          if (newQuantity > item.product.stock) {
            return item;
          }

          return { ...item, quantity: newQuantity };
        })
        .filter((item): item is CartItem => item !== null),
    );
  }

  // Remove a product from the cart
  function removeFromCart(productId: number) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product.id !== productId,
      ),
    );
  }

  // Submit customer order to the backend
  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (cart.length === 0) {
      setOrderError(true);
      setOrderMessage("Your shopping cart is empty.");
      return;
    }

    setSubmittingOrder(true);
    setOrderMessage("");
    setOrderError(false);

    const orderData = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      ...(customerEmail.trim()
        ? { customerEmail: customerEmail.trim() }
        : {}),
      fulfillmentMethod,
      ...(fulfillmentMethod === "DELIVERY"
        ? { deliveryAddress: deliveryAddress.trim() }
        : {}),
      ...(customerNote.trim()
        ? { customerNote: customerNote.trim() }
        : {}),
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(ORDERS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message = Array.isArray(result?.message)
          ? result.message.join(", ")
          : result?.message;

        throw new Error(
          message || "Unable to place your order. Please try again.",
        );
      }

      setCart([]);
      setCheckoutOpen(false);

      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setDeliveryAddress("");
      setCustomerNote("");
      setFulfillmentMethod("DELIVERY");

      setOrderError(false);
      setOrderMessage(
        `Your order #${result.id} has been placed successfully! Violette Optic will contact you to confirm your order.`,
      );

      // Refresh products to get updated stock
      const productsResponse = await fetch(API_URL);

      if (productsResponse.ok) {
        const updatedProducts: Product[] =
          await productsResponse.json();

        setProducts(updatedProducts);
      }
    } catch (err) {
      setOrderError(true);
      setOrderMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmittingOrder(false);
    }
  }

  return (
    <main>
      <div className="announcement">
        FREE CONSULTATION ON YOUR NEXT VISIT
      </div>

      <header className="navbar">
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>

        <Link href="/" className="logo">
          VIOLETTE<span> OPTIC</span>
        </Link>

        <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={() => setMobileMenu(false)}>
            Home
          </a>
          <a href="#collection" onClick={() => setMobileMenu(false)}>
            Collection
          </a>
          <a href="#about" onClick={() => setMobileMenu(false)}>
            About us
          </a>
          <a href="#contact" onClick={() => setMobileMenu(false)}>
            Contact
          </a>
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            aria-label="Search products"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search size={20} />
          </button>

          <button
            className="icon-button cart-button"
            aria-label={`Shopping cart, ${cartCount} items`}
            onClick={() => {
              setCartOpen(true);
              setCheckoutOpen(false);
            }}
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </button>

          <a href="/admin" className="admin-link">
            Admin
          </a>
        </div>
      </header>

      {searchOpen && (
        <div className="search-bar">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search for glasses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <button
            onClick={() => {
              setSearch("");
              setSearchOpen(false);
            }}
          >
            <X size={19} />
          </button>
        </div>
      )}

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="eyebrow">SEE THE WORLD DIFFERENTLY</span>

          <h1>
            A clearer view.
            <br />
            A <span>better style.</span>
          </h1>

          <p>
            Discover eyewear that combines elegance, comfort and
            personality. Find the perfect frames that express who you are.
          </p>

          <a href="#collection" className="primary-button">
            Discover our collection <ArrowRight size={18} />
          </a>

          <div className="hero-note">
            <Eye size={19} />
            <span>Elegance in every detail.</span>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200"
            alt="Stylish eyewear collection"
          />

          <div className="hero-caption">
            <span>VIOLETTE OPTIC</span>
            <p>Your vision, our passion.</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-item">
          <Eye size={25} />
          <div>
            <h3>Quality eyewear</h3>
            <p>Carefully selected frames</p>
          </div>
        </div>

        <div className="feature-item">
          <Heart size={25} />
          <div>
            <h3>Timeless elegance</h3>
            <p>Style that speaks for you</p>
          </div>
        </div>

        <div className="feature-item">
          <ShoppingBag size={25} />
          <div>
            <h3>Personal service</h3>
            <p>Your satisfaction matters</p>
          </div>
        </div>
      </section>

      <section className="collection" id="collection">
        <div className="section-heading">
          <span className="eyebrow">OUR SELECTION</span>
          <h2>Find your perfect frame</h2>
          <p>
            Explore our selection of eyewear designed to match your style.
          </p>
        </div>

        <div className="collection-controls">
          <div className="filters">
            {["All", "Optical", "Sunglasses"].map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={category === item ? "filter active" : "filter"}
              >
                {item}
              </button>
            ))}
          </div>

          <span className="product-count">
            {filteredProducts.length} products
          </span>
        </div>

        <div className="products-grid">
          {loading && <p>Loading products...</p>}

          {error && <p className="empty-message">{error}</p>}

          {filteredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-image">
                <img
                  src={getProductImageUrl(product.imageUrl)}
                  alt={product.name}
                />

                <span className="product-category">
                  {product.category}
                </span>
              </div>

              <div className="product-info">
                <h3>{product.name}</h3>
                <p>{product.description}</p>

                <div className="product-bottom">
                  <strong>
                    {Number(product.price).toFixed(2)} TND
                  </strong>

                  <span>
                    {product.stock > 0
                      ? `${product.stock} available`
                      : "Out of stock"}
                  </span>
                </div>

                <button
                  className="add-cart-button"
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product)}
                >
                  <ShoppingCart size={16} />
                  {product.stock <= 0 ? "Out of stock" : "Add to cart"}
                </button>
              </div>
            </article>
          ))}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="empty-message">
              No matching products found.
            </p>
          )}
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900"
            alt="Elegant eyewear"
          />
        </div>

        <div className="about-content">
          <span className="eyebrow">ABOUT VIOLETTE OPTIC</span>

          <h2>More than eyewear. A vision of elegance.</h2>

          <p>
            At Violette Optic, we believe that glasses are more than
            an accessory. They are part of your identity.
          </p>

          <p>
            Our mission is to help you see clearly while expressing
            your unique style through carefully selected eyewear.
          </p>

          <a href="#contact" className="secondary-button">
            Get in touch <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <span className="eyebrow">WE ARE HERE FOR YOU</span>

        <h2>Let&apos;s find your perfect vision.</h2>

        <p>
          Have a question about our collection? Get in touch with Violette Optic.
        </p>

        <a href="mailto:contact@violetteoptic.com" className="primary-button">
          Contact us <ArrowRight size={18} />
        </a>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div>
            <Link href="/" className="logo footer-logo">
              VIOLETTE<span> OPTIC</span>
            </Link>

            <p>Your vision, our passion.</p>
          </div>

          <div className="footer-links">
            <h3>Explore</h3>
            <a href="#home">Home</a>
            <a href="#collection">Collection</a>
            <a href="#about">About us</a>
          </div>

          <div className="footer-links">
            <h3>Follow us</h3>
            <a href="#contact">Instagram</a>
            <a href="#contact">Facebook</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Violette Optic. All rights reserved.</p>
          <a href="/admin">Administration</a>
        </div>
      </footer>

      {/* SHOPPING CART DRAWER */}
      {cartOpen && (
        <div
          className="cart-overlay"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-header">
              <h2>
                {checkoutOpen ? "Checkout" : "Your shopping bag"}
              </h2>

              <button
                className="cart-close"
                aria-label="Close shopping cart"
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(false);
                }}
              >
                <X size={23} />
              </button>
            </div>

            {orderMessage && (
              <div
                className={`order-message ${
                  orderError ? "order-error" : ""
                }`}
              >
                {orderMessage}
              </div>
            )}

            {!checkoutOpen && (
              <>
                {cart.length === 0 ? (
                  <div className="cart-empty">
                    <ShoppingBag size={40} />
                    <p>Your shopping bag is empty.</p>
                    <button
                      className="checkout-button"
                      onClick={() => {
                        setCartOpen(false);
                        document
                          .getElementById("collection")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Explore collection
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {cart.map((item) => (
                        <div className="cart-item" key={item.product.id}>
                          <img
                            src={getProductImageUrl(item.product.imageUrl)}
                            alt={item.product.name}
                          />

                          <div className="cart-item-info">
                            <h3>{item.product.name}</h3>

                            <p>
                              {Number(item.product.price).toFixed(2)} TND
                            </p>

                            <div className="cart-item-actions">
                              <div className="quantity-control">
                                <button
                                  aria-label="Decrease quantity"
                                  onClick={() =>
                                    updateCartQuantity(item.product.id, -1)
                                  }
                                >
                                  <Minus size={15} />
                                </button>

                                <span>{item.quantity}</span>

                                <button
                                  aria-label="Increase quantity"
                                  disabled={
                                    item.quantity >= item.product.stock
                                  }
                                  onClick={() =>
                                    updateCartQuantity(item.product.id, 1)
                                  }
                                >
                                  <Plus size={15} />
                                </button>
                              </div>

                              <button
                                className="remove-cart-item"
                                aria-label={`Remove ${item.product.name}`}
                                onClick={() =>
                                  removeFromCart(item.product.id)
                                }
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cart-total">
                      <span>Total</span>
                      <strong>{cartTotal.toFixed(2)} TND</strong>
                    </div>

                    <button
                      className="checkout-button"
                      onClick={() => {
                        setCheckoutOpen(true);
                        setOrderMessage("");
                        setOrderError(false);
                      }}
                    >
                      Continue to checkout <ArrowRight size={17} />
                    </button>
                  </>
                )}
              </>
            )}

            {/* CHECKOUT FORM */}
            {checkoutOpen && (
              <form
                className="checkout-form"
                onSubmit={handleOrderSubmit}
              >
                <h3>Customer information</h3>

                <label htmlFor="customerName">Full name *</label>
                <input
                  id="customerName"
                  type="text"
                  required
                  maxLength={100}
                  value={customerName}
                  onChange={(event) =>
                    setCustomerName(event.target.value)
                  }
                  placeholder="Enter your full name"
                />

                <label htmlFor="customerPhone">Phone number *</label>
                <input
                  id="customerPhone"
                  type="tel"
                  required
                  minLength={8}
                  maxLength={20}
                  pattern="[+0-9()\- ]{8,20}"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(event.target.value)
                  }
                  placeholder="+216 XX XXX XXX"
                />

                <label htmlFor="customerEmail">
                  Email address (optional)
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  maxLength={191}
                  value={customerEmail}
                  onChange={(event) =>
                    setCustomerEmail(event.target.value)
                  }
                  placeholder="your@email.com"
                />

                <h3>Delivery method</h3>

                <div className="fulfillment-options">
                  <label>
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value="DELIVERY"
                      checked={fulfillmentMethod === "DELIVERY"}
                      onChange={() => setFulfillmentMethod("DELIVERY")}
                    />
                    Home delivery
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="fulfillmentMethod"
                      value="PICKUP"
                      checked={fulfillmentMethod === "PICKUP"}
                      onChange={() => setFulfillmentMethod("PICKUP")}
                    />
                    Store pickup
                  </label>
                </div>

                {fulfillmentMethod === "DELIVERY" && (
                  <>
                    <label htmlFor="deliveryAddress">
                      Delivery address *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      required
                      maxLength={500}
                      rows={3}
                      value={deliveryAddress}
                      onChange={(event) =>
                        setDeliveryAddress(event.target.value)
                      }
                      placeholder="Enter your complete delivery address"
                    />
                  </>
                )}

                <label htmlFor="customerNote">
                  Additional note (optional)
                </label>
                <textarea
                  id="customerNote"
                  rows={3}
                  maxLength={1000}
                  value={customerNote}
                  onChange={(event) =>
                    setCustomerNote(event.target.value)
                  }
                  placeholder="Any additional information?"
                />

                <div className="cart-total">
                  <span>Order total</span>
                  <strong>{cartTotal.toFixed(2)} TND</strong>
                </div>

                <button
                  type="submit"
                  className="checkout-button"
                  disabled={submittingOrder || cart.length === 0}
                >
                  {submittingOrder
                    ? "Placing your order..."
                    : "Confirm order"}
                  {!submittingOrder && <ArrowRight size={17} />}
                </button>

                <button
                  type="button"
                  className="checkout-button"
                  disabled={submittingOrder}
                  onClick={() => setCheckoutOpen(false)}
                >
                  Back to shopping bag
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
