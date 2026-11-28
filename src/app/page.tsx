
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Eye,
  Heart,
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

const API_URL = "http://localhost:3001/products";
const BACKEND_URL = "http://localhost:3001";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  // Convert the backend's relative image path into a complete URL
  function getProductImageUrl(imageUrl: string | null) {
    if (!imageUrl) {
      return "/placeholder.png";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${BACKEND_URL}${imageUrl}`;
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

          <a href="#collection" className="icon-button" aria-label="Shop">
            <ShoppingBag size={20} />
          </a>

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
                  <strong>{product.price} TND</strong>

                  <span>
                    View details <ArrowRight size={15} />
                  </span>
                </div>
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
    </main>
  );
}
