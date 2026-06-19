import "./globals.css";
import { CartProvider } from "./context/CartContext";
import CartButton from "./components/CartButton";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "NhomTTTN Music",
  description: "Website bán Saxophone chính hãng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={poppins.className}>
        <CartProvider>
          <header className="header">
            <div className="logo">
              <h1>NhomTTTN Music</h1>
              <p>Website bán nhạc cụ & Saxophone</p>
            </div>

            <div className="search">
              <input type="text" placeholder="Tìm kiếm sản phẩm..." />
            </div>

            <CartButton />
          </header>

          <nav className="menu">
            <a href="/">Trang Chủ</a>
            <a href="/products">Sản Phẩm</a>
            <a href="/cart">Giỏ Hàng</a>
            <a href="/orders">Đơn Đã Mua</a>
            <a href="/login">Đăng Nhập</a>
            <a href="/register">Đăng Ký</a>
            <a href="/admin">Admin</a>
          </nav>

          {children}

          <footer className="footer">
            <div className="footer-container">
              <div className="footer-column">
                <h3>NhomTTTN Music</h3>
                <p>Chuyên cung cấp Saxophone chính hãng.</p>
                <p>📍 TP. Hồ Chí Minh, Việt Nam</p>
                <p>📞 0900 123 456</p>
                <p>✉️ support@nhomtttnmusic.vn</p>
              </div>

              <div className="footer-column">
                <h3>Thông Tin</h3>
                <p>Giới thiệu</p>
                <p>Chính sách bảo hành</p>
                <p>Chính sách đổi trả</p>
                <p>Điều khoản sử dụng</p>
              </div>

              <div className="footer-column">
                <h3>Danh Mục</h3>
                <p>Alto Saxophone</p>
                <p>Tenor Saxophone</p>
                <p>Soprano Saxophone</p>
                <p>Phụ kiện Saxophone</p>
              </div>

              <div className="footer-column">
                <h3>Kết Nối</h3>
                <div className="social-icons">
                  <a href="#">Facebook</a>
                  <a href="#">Zalo</a>
                  <a href="#">YouTube</a>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              © 2026 NhomTTTN Music | AWS Cloud Project
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}