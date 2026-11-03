import { Navbar } from "nextra-theme-docs";

const products = new Set(["ulms", "uclass", "uagent"]);

export default function ProductNavbar({ items, ...props }) {
  // Nextra gives metadata-only links an empty route when a translation is
  // missing. Match each product by its module path instead of that empty route.
  const productItems = items.map((item) =>
    products.has(item.name) ? { ...item, route: `/${item.name}` } : item
  );

  return <Navbar {...props} items={productItems} />;
}
