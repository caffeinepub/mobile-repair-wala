import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import {
  Battery,
  ChevronDown,
  Clock,
  Cpu,
  Droplets,
  Facebook,
  Instagram,
  MapPin,
  MessageCircle,
  Monitor,
  Phone,
  Plug,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Stethoscope,
  Trash2,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import {
  useAddToCart,
  useClearCart,
  useGetAllProducts,
  useGetCartContents,
  useRemoveFromCart,
} from "./hooks/useQueries";

/* ─── Product image map ─────────────────────────────────── */
const productImageMap: Record<string, string> = {
  "Mobile Cover": "/assets/generated/product-cover.dim_400x400.jpg",
  "Tempered Glass": "/assets/generated/product-glass.dim_400x400.jpg",
  "Fast Charger": "/assets/generated/product-charger.dim_400x400.jpg",
  "Wireless Earphones": "/assets/generated/product-earphones.dim_400x400.jpg",
  "Bluetooth Speaker": "/assets/generated/product-speaker.dim_400x400.jpg",
  "Power Bank": "/assets/generated/product-powerbank.dim_400x400.jpg",
  "Phone Holder": "/assets/generated/product-holder.dim_400x400.jpg",
  "Data Cable": "/assets/generated/product-cable.dim_400x400.jpg",
};

function getProductImage(name: string): string {
  return (
    productImageMap[name] ?? "/assets/generated/product-cover.dim_400x400.jpg"
  );
}

/* ─── Fallback static products ──────────────────────────── */
const STATIC_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Mobile Cover",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(999),
  },
  {
    id: "2",
    name: "Tempered Glass",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(299),
  },
  {
    id: "3",
    name: "Fast Charger",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(1499),
  },
  {
    id: "4",
    name: "Wireless Earphones",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(2999),
  },
  {
    id: "5",
    name: "Bluetooth Speaker",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(3499),
  },
  {
    id: "6",
    name: "Power Bank",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(1999),
  },
  {
    id: "7",
    name: "Phone Holder",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(699),
  },
  {
    id: "8",
    name: "Data Cable",
    imageUrl: "",
    category: "Accessories",
    price: BigInt(399),
  },
];

/* ─── Scroll Reveal Hook ────────────────────────────────── */
function useScrollReveal(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      const els = containerRef.current?.querySelectorAll(".reveal");
      if (els) for (const el of els) el.classList.add("visible");
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    const els = containerRef.current?.querySelectorAll(".reveal");
    if (els) for (const el of els) observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({
  onCartOpen,
  cartCount,
}: { onCartOpen: () => void; cartCount: number }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "Accessories", href: "#accessories" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "navbar-scrolled" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#home" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center pulse-glow">
            <Phone className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-black text-xl tracking-tight">
            <span className="neon-text-cyan">Mobile Repair</span>
            <span className="text-foreground/90"> Wala</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-ocid={`nav.link.${i + 1}`}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 hover:neon-text-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Cart button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCartOpen}
            data-ocid="cart.open_modal_button"
            className="relative p-2.5 rounded-xl glass border border-border/50 hover:border-primary/50 transition-all duration-200 hover:neon-cyan-glow group"
          >
            <ShoppingCart className="w-5 h-5 text-foreground/80 group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-0">
                {cartCount}
              </Badge>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg glass border border-border/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-5 h-0.5 bg-foreground/80 mb-1.5 transition-all" />
            <div className="w-5 h-0.5 bg-foreground/80 mb-1.5 transition-all" />
            <div className="w-5 h-0.5 bg-foreground/80 transition-all" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-t border-border/30 px-4 py-4 space-y-3">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              data-ocid={`nav.link.${i + 5}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

/* ─── Hero Section ───────────────────────────────────────── */
function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref as React.RefObject<HTMLElement | null>);

  return (
    <section
      id="home"
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-repair-bg.dim_1920x1080.jpg')",
        }}
      />
      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

      {/* Floating phone graphic */}
      <div className="absolute right-8 md:right-20 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none z-10">
        <div className="float-phone w-32 h-56 rounded-3xl border-2 border-primary/50 glass neon-cyan-glow flex flex-col items-center justify-center gap-2 relative overflow-hidden">
          {/* Screen */}
          <div className="absolute inset-2 rounded-2xl bg-gradient-to-b from-primary/10 to-secondary/10 flex items-center justify-center">
            <Phone className="w-8 h-8 text-primary opacity-80" />
          </div>
          {/* Home button */}
          <div className="absolute bottom-2 w-8 h-1.5 rounded-full bg-primary/40" />
          {/* Scan line animation */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background:
                "linear-gradient(180deg, transparent 40%, oklch(0.78 0.20 200 / 0.3) 50%, transparent 60%)",
              animation: "scanLine 3s linear infinite",
            }}
          />
        </div>
        {/* Glow rings */}
        <div className="absolute -inset-4 rounded-full border border-primary/10 animate-pulse" />
        <div
          className="absolute -inset-8 rounded-full border border-primary/5 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
        {/* Badge */}
        <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/30 text-xs font-semibold text-primary mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Professional Mobile Repair & Accessories
        </div>

        {/* Headline */}
        <h1 className="reveal reveal-delay-1 font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-tight mb-6">
          <span className="text-foreground">Fast &amp; Professional</span>
          <br />
          <span className="neon-text-cyan">Mobile Repair</span>
          <br />
          <span className="text-foreground">Services</span>
        </h1>

        {/* Subtext */}
        <p className="reveal reveal-delay-2 text-base sm:text-lg text-foreground/60 mb-10 max-w-xl mx-auto">
          Screen Replacement &bull; Battery Replacement &bull; Water Damage
          Repair &bull; Software Fix
        </p>

        {/* CTA Buttons */}
        <div className="reveal reveal-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="tel:+1234567890"
            data-ocid="hero.primary_button"
            className="btn-neon-cyan flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
          <a
            href="https://wa.me/1234567890"
            data-ocid="hero.secondary_button"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon-green flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Chat
          </a>
          <a
            href="#accessories"
            data-ocid="hero.button"
            className="btn-neon-purple flex items-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-200"
          >
            <ShoppingBag className="w-4 h-4" />
            View Accessories
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="reveal reveal-delay-4 mt-16 flex flex-col items-center gap-2 text-foreground/30">
          <span className="text-xs font-medium tracking-widest uppercase">
            Scroll Down
          </span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

/* ─── Services Section ───────────────────────────────────── */
const services = [
  {
    icon: Monitor,
    name: "Screen Replacement",
    desc: "Crystal-clear OEM screen replacements for all major smartphone brands. Same-day service available.",
  },
  {
    icon: Battery,
    name: "Battery Replacement",
    desc: "Genuine battery upgrades to restore full charging capacity and extend device lifespan.",
  },
  {
    icon: Droplets,
    name: "Water Damage Repair",
    desc: "Advanced ultrasonic cleaning and component-level repair for water-damaged devices.",
  },
  {
    icon: Cpu,
    name: "Software Flashing",
    desc: "IMEI restoration, custom ROM flashing, factory reset, and firmware upgrades for all brands.",
  },
  {
    icon: Plug,
    name: "Charging Port Repair",
    desc: "Micro-soldering repair for broken, loose, or non-functional charging ports and connectors.",
  },
  {
    icon: Wifi,
    name: "Network Issue Repair",
    desc: "IMEI repair, network antenna fixes, baseband restoration, and SIM card tray replacements.",
  },
];

function ServicesSection() {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref as React.RefObject<HTMLElement | null>);

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-24 overflow-hidden section-bg-overlay"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/services-bg.dim_1920x1080.jpg')",
        }}
      />

      <div className="section-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-secondary/30 text-xs font-semibold text-secondary mb-4">
            <Cpu className="w-3 h-3" />
            Expert Repair Services
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-black text-3xl sm:text-5xl text-foreground">
            Our <span className="neon-text-cyan">Repair</span> Services
          </h2>
          <p className="reveal reveal-delay-2 mt-4 text-foreground/60 max-w-md mx-auto">
            Professional repairs with genuine parts and warranty. Most repairs
            completed in under 2 hours.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            const delay = `reveal-delay-${Math.min(i + 1, 6)}` as const;
            return (
              <div
                key={service.name}
                data-ocid={`services.card.${i + 1}`}
                className={`reveal ${delay} service-card glass-card rounded-2xl p-6 cursor-default`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {service.name}
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  {service.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Accessories Section ────────────────────────────────── */
function ProductCard({
  product,
  index,
  onAddToCart,
  isAdding,
}: {
  product: Product;
  index: number;
  onAddToCart: (id: string) => void;
  isAdding: boolean;
}) {
  const delay = `reveal-delay-${Math.min(index + 1, 6)}` as const;
  const price = (Number(product.price) / 100).toFixed(2);

  return (
    <div
      data-ocid={`accessories.item.${index + 1}`}
      className={`reveal ${delay} product-card glass-card rounded-2xl overflow-hidden flex flex-col`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getProductImage(product.name)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-semibold">
          {product.category}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-bold text-foreground mb-1">
          {product.name}
        </h3>
        <p className="text-primary font-black text-xl mb-3">${price}</p>
        <button
          type="button"
          data-ocid={`accessories.button.${index + 1}`}
          onClick={() => onAddToCart(product.id)}
          disabled={isAdding}
          className="mt-auto btn-neon-cyan w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-4 h-4" />
          {isAdding ? "Adding…" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}

function AccessoriesSection({ onCartOpen }: { onCartOpen: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref as React.RefObject<HTMLElement | null>);

  const { data: products, isLoading, isError } = useGetAllProducts();
  const addToCart = useAddToCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  const displayProducts =
    products && products.length > 0 ? products : STATIC_PRODUCTS;

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await addToCart.mutateAsync(productId);
      toast.success("Added to cart!", {
        description: "Item successfully added to your cart.",
        action: {
          label: "View Cart",
          onClick: onCartOpen,
        },
      });
    } catch {
      toast.error("Failed to add item. Please try again.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <section
      id="accessories"
      ref={ref}
      className="relative py-24 overflow-hidden section-bg-overlay"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/assets/generated/accessories-bg.dim_1920x1080.jpg')",
        }}
      />

      <div className="section-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/30 text-xs font-semibold text-primary mb-4">
            <ShoppingBag className="w-3 h-3" />
            Premium Accessories
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-black text-3xl sm:text-5xl text-foreground">
            Mobile <span className="neon-text-purple">Accessories</span> Store
          </h2>
          <p className="reveal reveal-delay-2 mt-4 text-foreground/60 max-w-md mx-auto">
            Top-quality accessories for every smartphone. Competitive prices and
            genuine products.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div
            data-ocid="accessories.loading_state"
            className="grid grid-cols-2 md:grid-cols-4 gap-5"
          >
            {Array.from({ length: 8 }, (_, i) => `skel-${i}`).map((k) => (
              <div key={k} className="glass-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div
            data-ocid="accessories.error_state"
            className="text-center py-12"
          >
            <p className="text-destructive">
              Failed to load products. Showing catalog.
            </p>
          </div>
        )}

        {/* Products grid */}
        {!isLoading &&
          (displayProducts.length === 0 ? (
            <div
              data-ocid="accessories.empty_state"
              className="text-center py-20 glass-card rounded-2xl"
            >
              <ShoppingBag className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
              <p className="text-foreground/50 font-medium">
                No products available yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {displayProducts.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onAddToCart={handleAddToCart}
                  isAdding={addingId === product.id}
                />
              ))}
            </div>
          ))}
      </div>
    </section>
  );
}

/* ─── Why Choose Us ──────────────────────────────────────── */
const features = [
  {
    icon: Star,
    title: "Expert Technicians",
    desc: "Certified repair specialists with 5+ years of experience handling all major smartphone brands.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    desc: "Most repairs completed within 1-2 hours. Express service available for urgent repairs.",
  },
  {
    icon: Shield,
    title: "Genuine Parts",
    desc: "We use only OEM or high-grade compatible parts with 90-day replacement warranty.",
  },
  {
    icon: Stethoscope,
    title: "Free Diagnosis",
    desc: "No-obligation diagnostic check for every device. Know the issue before committing to repair.",
  },
];

function WhyChooseUs() {
  const ref = useRef<HTMLElement>(null);
  useScrollReveal(ref as React.RefObject<HTMLElement | null>);

  return (
    <section id="why-us" ref={ref} className="py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/30 text-xs font-semibold text-primary mb-4">
            <Shield className="w-3 h-3" />
            Why Mobile Repair Wala
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-black text-3xl sm:text-5xl text-foreground">
            Why <span className="neon-text-cyan">Choose Us?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const delay = `reveal-delay-${i + 1}` as const;
            return (
              <div
                key={feature.title}
                data-ocid={`features.card.${i + 1}`}
                className={`reveal ${delay} glass-card rounded-2xl p-6 text-center group hover:border-primary/40 transition-all duration-300`}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 group-hover:neon-cyan-glow transition-all duration-300">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/55 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Contact / Footer ───────────────────────────────────── */
function ContactFooter() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      id="contact"
      data-ocid="contact.section"
      className="relative border-t border-border/30 overflow-hidden"
    >
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display font-black text-lg">
                <span className="neon-text-cyan">Mobile Repair</span>
                <span className="text-foreground/90"> Wala</span>
              </span>
            </div>
            <p className="text-sm text-foreground/55 leading-relaxed mb-4">
              Your trusted partner for professional mobile repair and premium
              accessories. Quality service, every time.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass border border-border/50 flex items-center justify-center hover:border-primary/50 hover:text-primary transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl glass border border-border/50 flex items-center justify-center hover:border-secondary/50 hover:text-secondary transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-4">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm text-foreground/60">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="hover:text-primary transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  WhatsApp: +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>123 Tech Street, Mobile City, MC 10001</span>
              </div>
            </div>
          </div>

          {/* Working hours */}
          <div>
            <h3 className="font-display font-bold text-foreground mb-4">
              Working Hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-foreground/60">
                <span>Monday – Friday</span>
                <span className="text-primary font-semibold">
                  9:00 AM – 8:00 PM
                </span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Saturday</span>
                <span className="text-primary font-semibold">
                  10:00 AM – 7:00 PM
                </span>
              </div>
              <div className="flex justify-between text-foreground/60">
                <span>Sunday</span>
                <span className="text-secondary font-semibold">
                  11:00 AM – 5:00 PM
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-foreground/50">Currently Open</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/40">
          <span>© {year} Mobile Repair Wala. All rights reserved.</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/60 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Cart Drawer ─────────────────────────────────────────── */
function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: cartItems, isLoading } = useGetCartContents();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromCart.mutateAsync(productId);
      toast.success("Item removed from cart.");
    } catch {
      toast.error("Failed to remove item.");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart.mutateAsync();
      toast.success("Cart cleared.");
    } catch {
      toast.error("Failed to clear cart.");
    } finally {
      setClearing(false);
    }
  };

  // Close on backdrop click/key
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };
  const handleBackdropKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") onClose();
  };

  if (!open) return null;

  const items = cartItems ?? [];
  const total = items.reduce((sum, p) => sum + Number(p.price) / 100, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={handleBackdropClick}
      onKeyDown={handleBackdropKey}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Drawer panel */}
      <div
        data-ocid="cart.modal"
        className="relative w-full max-w-sm h-full glass-card border-l border-border/30 flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/20">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg text-foreground">
              Your Cart
            </h2>
            {items.length > 0 && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                {items.length}
              </Badge>
            )}
          </div>
          <button
            type="button"
            data-ocid="cart.close_button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <X className="w-5 h-5 text-foreground/70" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div data-ocid="cart.loading_state" className="p-5 space-y-4">
              {Array.from({ length: 3 }, (_, i) => `cskel-${i}`).map((k) => (
                <div key={k} className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div
              data-ocid="cart.empty_state"
              className="flex flex-col items-center justify-center h-full py-20 px-5 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-foreground/30" />
              </div>
              <p className="font-medium text-foreground/60 mb-1">
                Your cart is empty
              </p>
              <p className="text-sm text-foreground/40">
                Add accessories to get started.
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {items.map((item, i) => (
                <div
                  key={`${item.id}-${i}`}
                  data-ocid={`cart.item.${i + 1}`}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/20"
                >
                  <img
                    src={getProductImage(item.name)}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-primary font-bold text-sm">
                      ${(Number(item.price) / 100).toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`cart.delete_button.${i + 1}`}
                    onClick={() => handleRemove(item.id)}
                    disabled={removingId === item.id}
                    className="p-1.5 rounded-lg hover:bg-destructive/20 text-foreground/40 hover:text-destructive transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-border/20 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60 font-medium">Total</span>
              <span className="text-primary font-black text-lg">
                ${total.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              className="btn-neon-cyan w-full py-3 rounded-xl font-bold text-sm"
              onClick={() => toast.info("Checkout coming soon!")}
            >
              Checkout
            </button>
            <button
              type="button"
              data-ocid="cart.secondary_button"
              onClick={handleClearCart}
              disabled={clearing}
              className="w-full py-2.5 rounded-xl text-sm text-foreground/60 hover:text-destructive flex items-center justify-center gap-2 hover:bg-destructive/10 transition-all disabled:opacity-50 border border-border/30"
            >
              <Trash2 className="w-4 h-4" />
              {clearing ? "Clearing…" : "Clear Cart"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── App Root ───────────────────────────────────────────── */
export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const { data: cartItems } = useGetCartContents();
  const cartCount = cartItems?.length ?? 0;

  // Update document title
  useEffect(() => {
    document.title =
      "Mobile Repair Wala – Professional Mobile Repair & Accessories";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="bottom-right" theme="dark" />

      <Navbar onCartOpen={() => setCartOpen(true)} cartCount={cartCount} />

      <main>
        <HeroSection />
        <ServicesSection />
        <AccessoriesSection onCartOpen={() => setCartOpen(true)} />
        <WhyChooseUs />
      </main>

      <ContactFooter />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
