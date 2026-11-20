import { useEffect, useState } from 'react';
import './ShopPage.css';

interface ShopItem {
  id: number;
  name: string;
  type: string;
  price: number;
  asset_path: string;
}

function isShopItemList(value: unknown): value is ShopItem[] {
  return Array.isArray(value) && value.every((item) =>
    typeof item === 'object'
    && item !== null
    && 'id' in item
    && typeof item.id === 'number'
    && 'name' in item
    && typeof item.name === 'string'
    && 'type' in item
    && typeof item.type === 'string'
    && 'price' in item
    && typeof item.price === 'number'
    && 'asset_path' in item
    && typeof item.asset_path === 'string'
  );
}

function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadShopItems() {
      try {
        const response = await fetch('/api/shop', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`Could not load shop items (HTTP ${response.status}).`);
        }

        const result: unknown = await response.json();
        if (!isShopItemList(result)) {
          throw new Error('The server returned shop items in an unexpected format.');
        }

        setItems(result.filter((item) => item.type === 'SKIN'));
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(loadError instanceof Error ? loadError.message : 'Could not load shop items.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadShopItems();
    return () => controller.abort();
  }, []);

  return (
    <div className="shop">
      <h1 className="shop-title">Shop</h1>
      {isLoading && <p role="status">Loading skins...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && !error && items.length === 0 && <p>No skins available.</p>}
      {!isLoading && !error && items.length > 0 && (
        <div className="costume-list">
          {items.map((item) => (
            <div key={item.id} className="costume-card">
              <h3 className="costume-card__name">{item.name}</h3>
              <div className="costume-card__image-container">
                <img src={item.asset_path} alt={item.name} className="costume-card__image" />
                <div className="costume-card__overlay">
                  <p className="costume-card__price">${item.price.toFixed(2)}</p>
                  <button className="costume-card__buy-button">Buy</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;