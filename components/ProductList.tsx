import { PRODUCTS } from '@/lib/products';
import ProductCard from './ProductCard';

export default function ProductList() {
  return (
    <section aria-labelledby="goods-title">
      <h2 className="section-title" id="goods-title">
        <span className="section-title__diamond" aria-hidden="true" />
        The Goods
      </h2>
      <ul className="products" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {PRODUCTS.map((p, i) => (
          <li key={p.id}>
            <ProductCard product={p} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}
