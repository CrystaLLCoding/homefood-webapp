import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [tgUser, setTgUser] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderForm, setOrderForm] = useState({ address: "", comment: "" });
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState("");

  useEffect(() => {
    WebApp.ready();
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
      setTgUser(WebApp.initDataUnsafe.user);
    }
  }, []);

  const fetchNearbyDishes = () => {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается вашим браузером");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(
            `https://YOUR_BACKEND_URL/dishes/nearby?lat=${lat}&lng=${lng}&radius=5`
          );
          if (!res.ok) throw new Error("Ошибка при получении блюд");
          const data = await res.json();
          setDishes(data);
        } catch (e) {
          setError("Ошибка при получении блюд");
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Не удалось получить геолокацию");
        setLoading(false);
      }
    );
  };

  const addToCart = (dish) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === dish.id);
      if (exists) {
        return prev.map((item) =>
          item.id === dish.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...dish, qty: 1 }];
    });
  };

  const removeFromCart = (dishId) => {
    setCart((prev) => prev.filter((item) => item.id !== dishId));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOrderChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const handleOrder = async () => {
    if (!orderForm.address) {
      setError("Введите адрес доставки");
      return;
    }
    setOrderLoading(true);
    setError("");
    setOrderSuccess("");
    try {
      // TODO: заменить на реальный backend URL и добавить авторизацию
      const res = await fetch("https://YOUR_BACKEND_URL/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'x-telegram-id': tgUser?.id, // если требуется авторизация
        },
        body: JSON.stringify({
          userId: tgUser?.id,
          cookId: cart[0]?.cookId, // для MVP — первый повар
          dishIds: cart.map((item) => item.id),
          total,
          address: orderForm.address,
          comment: orderForm.comment,
        }),
      });
      if (!res.ok) throw new Error("Ошибка при оформлении заказа");
      setOrderSuccess("Заказ успешно оформлен!");
      setCart([]);
      setOrderForm({ address: "", comment: "" });
      setShowCart(false);
    } catch (e) {
      setError("Ошибка при оформлении заказа");
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center p-4">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-[#0088cc] mb-2 mt-4">HomeFood</h1>
        {tgUser && (
          <div className="mb-4 text-gray-700">👋 Привет, {tgUser.first_name}!</div>
        )}
        <button
          className="bg-[#0088cc] text-white px-6 py-2 rounded-lg shadow hover:bg-[#0077b6] transition mb-6"
          onClick={fetchNearbyDishes}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Показать блюда рядом"}
        </button>
        <button
          className="ml-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mb-6"
          onClick={() => setShowCart((v) => !v)}
        >
          🛒 Корзина ({cart.reduce((sum, item) => sum + item.qty, 0)})
        </button>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {orderSuccess && <div className="text-green-600 mb-4">{orderSuccess}</div>}
        {showCart ? (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h2 className="text-xl font-bold mb-2">Корзина</h2>
            {cart.length === 0 ? (
              <div className="text-gray-500">Корзина пуста</div>
            ) : (
              <>
                <ul className="mb-4">
                  {cart.map((item) => (
                    <li key={item.id} className="flex justify-between items-center mb-2">
                      <span>{item.name} x {item.qty}</span>
                      <span>{item.price * item.qty} сум</span>
                      <button className="ml-2 text-red-500" onClick={() => removeFromCart(item.id)}>✕</button>
                    </li>
                  ))}
                </ul>
                <div className="font-bold mb-2">Итого: {total} сум</div>
                <input
                  className="border p-2 rounded w-full mb-2"
                  name="address"
                  placeholder="Адрес доставки"
                  value={orderForm.address}
                  onChange={handleOrderChange}
                />
                <input
                  className="border p-2 rounded w-full mb-2"
                  name="comment"
                  placeholder="Комментарий к заказу (необязательно)"
                  value={orderForm.comment}
                  onChange={handleOrderChange}
                />
                <button
                  className="bg-[#0088cc] text-white px-6 py-2 rounded-lg shadow hover:bg-[#0077b6] transition w-full"
                  onClick={handleOrder}
                  disabled={orderLoading}
                >
                  {orderLoading ? "Оформление..." : "Оформить заказ"}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                {dish.imageUrl && (
                  <img src={dish.imageUrl} alt={dish.name} className="rounded mb-2 h-32 object-cover" />
                )}
                <div className="font-bold text-lg mb-1">{dish.name}</div>
                <div className="text-gray-600 mb-1">{dish.category?.name}</div>
                <div className="text-[#0088cc] font-semibold mb-1">{dish.price} сум</div>
                <div className="text-sm text-gray-500 mb-1">Повар: {dish.cook?.user?.name}</div>
                <div className="text-xs text-gray-400 mb-2">Время приготовления: ~30 мин</div>
                <button
                  className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600"
                  onClick={() => addToCart(dish)}
                >
                  В корзину
                </button>
              </div>
            ))}
          </div>
        )}
        {dishes.length === 0 && !loading && !showCart && (
          <div className="text-gray-500 mt-8 text-center">Блюда рядом не найдены</div>
        )}
      </div>
    </div>
  );
}

export default App;
