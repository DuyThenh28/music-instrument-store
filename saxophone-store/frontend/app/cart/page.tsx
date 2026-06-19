"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Cart() {
  const [cart, setCart] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(data);
  }, []);

  const saveCart = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const getPriceNumber = (price: string) => {
    return Number(String(price).replaceAll(".", "").replace("đ", ""));
  };

  const increaseQuantity = (index: number) => {
    const newCart = [...cart];
    newCart[index].quantity = (newCart[index].quantity || 1) + 1;
    saveCart(newCart);
  };

  const decreaseQuantity = (index: number) => {
    const newCart = [...cart];

    if ((newCart[index].quantity || 1) > 1) {
      newCart[index].quantity -= 1;
    } else {
      newCart.splice(index, 1);
    }

    saveCart(newCart);
  };

  const removeItem = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + getPriceNumber(item.price) * (item.quantity || 1),
    0
  );

  const confirmOrder = () => {
  if (!customer.name || !customer.phone || !customer.address) {
    alert("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ");
    return;
  }

  const oldOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  const newOrder = {
    id: "DH" + Date.now(),
    customer,
    products: cart,
    totalItems,
    totalPrice,
    status: "Chờ xác nhận",
    createdAt: new Date().toLocaleString("vi-VN"),
  };

  localStorage.setItem(
    "orders",
    JSON.stringify([newOrder, ...oldOrders])
  );

  setShowCheckout(false);
  clearCart();

  setCustomer({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  window.location.href = "/orders";
};

  return (
    <main className="cart-page">
      <h1 className="cart-title">Giỏ Hàng Của Bạn</h1>

      {cart.length === 0 ? (
        <div className="empty-cart-box">
          <div className="empty-cart-icon">🛒</div>
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy chọn thêm sản phẩm saxophone yêu thích của bạn.</p>

          <Link href="/products">
            <button className="continue-btn">Tiếp tục mua hàng</button>
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {cart.map((item, index) => (
              <div className="cart-item-card" key={index}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-img"
                />

                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{item.price}</p>

                  <div className="quantity-box">
                    <button onClick={() => decreaseQuantity(index)}>-</button>
                    <span>{item.quantity || 1}</span>
                    <button onClick={() => increaseQuantity(index)}>+</button>
                  </div>
                </div>

                <div className="cart-item-total">
                  <p>
                    {(
                      getPriceNumber(item.price) * (item.quantity || 1)
                    ).toLocaleString("vi-VN")}
                    đ
                  </p>

                  <button
                    className="delete-btn"
                    onClick={() => removeItem(index)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </section>

          <aside className="cart-summary-box">
            <h2>Thông tin đơn hàng</h2>

            <div className="summary-row">
              <span>Tổng sản phẩm</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>{totalPrice.toLocaleString("vi-VN")}đ</strong>
            </div>

            <div className="summary-row">
              <span>Phí vận chuyển</span>
              <strong>Miễn phí</strong>
            </div>

            <div className="summary-total">
              <span>Tổng tiền</span>
              <strong>{totalPrice.toLocaleString("vi-VN")}đ</strong>
            </div>

            <button
              className="order-btn"
              onClick={() => setShowCheckout(true)}
            >
              Đặt Hàng
            </button>

            <Link href="/products">
              <button className="continue-shopping-btn">
                Tiếp tục mua hàng
              </button>
            </Link>

            <button className="clear-cart-btn" onClick={clearCart}>
              Xóa toàn bộ giỏ hàng
            </button>
          </aside>
        </div>
      )}

      {showCheckout && (
        <div className="checkout-overlay">
          <div className="checkout-box">
            <h2>Thông tin đặt hàng</h2>

            <input
              type="text"
              placeholder="Họ và tên"
              value={customer.name}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Số điện thoại"
              value={customer.phone}
              onChange={(e) =>
                setCustomer({ ...customer, phone: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Địa chỉ nhận hàng"
              value={customer.address}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />

            <textarea
              placeholder="Ghi chú thêm"
              value={customer.note}
              onChange={(e) =>
                setCustomer({ ...customer, note: e.target.value })
              }
            />

            <div className="checkout-total-box">
              <span>Tổng thanh toán</span>
              <strong>{totalPrice.toLocaleString("vi-VN")}đ</strong>
            </div>

            <div className="checkout-actions">
              <button className="confirm-order-btn" onClick={confirmOrder}>
                Xác nhận đặt hàng
              </button>

              <button
                className="cancel-order-btn"
                onClick={() => setShowCheckout(false)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}