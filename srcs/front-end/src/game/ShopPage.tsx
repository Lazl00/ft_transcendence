import './ShopPage.css';

type ShopItem = {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
};

const items: ShopItem[] = [
  {
    id: 'neon-suit',
    name: 'Neon Suit',
    image: '/favicon.svg',
    price: 250,
    description: 'A bright look for your next match.',
  },
  {
    id: 'steampunk-armor',
    name: 'Steampunk Armor',
    image: '/favicon.svg',
    price: 350,
    description: 'A stylish armor for the victors.',
  },
  {
    id: 'samurai-armor',
    name: 'Samurai Armor',
    image: '/favicon.svg',
    price: 450,
    description: 'A traditional armor for the brave.',
  },
  {
    id: 'transcendence-aura',
    name: 'Transcendence Aura',
    image: '/favicon.svg',
    price: 1000,
    description: 'A powerful aura for the chosen one.',
  }
];

function ShopPage() {
  return (
    <div className="shop">
      <h1 className="shop-title">Shop</h1>
      <div className="costume-list">
        {items.map((item) => (
          <div key={item.id} className="costume-card">
            <h3 className="costume-card__name">{item.name}</h3>
            <div className="costume-card__image-container">
              <img src={item.image} alt={item.name} className="costume-card__image" />
              <div className="costume-card__overlay">
                <p className="costume-card__description">{item.description}</p>
                <p className="costume-card__price">${item.price.toFixed(2)}</p>
              </div>
            </div>
            <button className="costume-card__buy-button">Buy</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopPage;