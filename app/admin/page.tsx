"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Box, Check, ClipboardList, LogOut, PackagePlus, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  stock_quantity: number;
  reserved_quantity: number;
  active: boolean;
  colors: string[];
  sizes: string[];
  types: string[];
  images: string[];
};

type OrderItem = {
  merch_name: string;
  quantity: number;
  unit_price: number;
  selected_color?: string | null;
  selected_size?: string | null;
  selected_type?: string | null;
};

type Order = {
  id: string;
  order_code: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  subtotal: number;
  shipping_fee: number;
  discount_code_amount: number;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
};

type Tab = "orders" | "products";

const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} đ`;
const statusName: Record<string, string> = {
  init: "Chờ thanh toán",
  in_progress: "Đang xử lý",
  done: "Đã thanh toán",
  cancel: "Đã hủy",
  drop: "Hết hạn",
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || `Lỗi máy chủ (${response.status}).`);
  return payload as T;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-xs font-semibold text-[#777]">
      {label}
      <input {...props} className={`h-10 min-w-0 rounded-md border border-[#DDD] bg-white px-3 text-sm font-normal text-[#171717] outline-none focus:border-[#FF017E] ${props.className ?? ""}`} />
    </label>
  );
}

export default function AdminPage() {
  const [configured, setConfigured] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", stock_quantity: "20", image: "/merch/indie-shirt-white.webp", description: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextProducts, nextOrders] = await Promise.all([
        api<Product[]>("/api/admin/products"),
        api<Order[]>("/api/admin/orders"),
      ]);
      setProducts(nextProducts);
      setOrders(nextOrders);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void api<{ configured: boolean; authenticated: boolean }>("/api/admin/session")
      .then((session) => {
        setConfigured(session.configured);
        setAuthenticated(session.authenticated);
        if (session.authenticated) void loadData();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [loadData]);

  const metrics = useMemo(() => ({
    orderCount: orders.length,
    pending: orders.filter((order) => order.status === "init" || order.status === "in_progress").length,
    revenue: orders.filter((order) => order.status === "done").reduce((sum, order) => sum + Number(order.total), 0),
    products: products.filter((product) => product.active).length,
  }), [orders, products]);

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy("login");
    setError(null);
    try {
      await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) });
      setAuthenticated(true);
      setPassword("");
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không đăng nhập được.");
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    await api("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setProducts([]);
    setOrders([]);
  };

  const saveProduct = async (product: Product) => {
    setBusy(product.id);
    setError(null);
    setNotice(null);
    try {
      const updated = await api<Product>(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        body: JSON.stringify(product),
      });
      setProducts((current) => current.map((item) => item.id === updated.id ? updated : item));
      setNotice(`Đã lưu ${updated.name}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không lưu được sản phẩm.");
    } finally {
      setBusy(null);
    }
  };

  const updateProduct = (id: string, changes: Partial<Product>) => {
    setProducts((current) => current.map((product) => product.id === id ? { ...product, ...changes } : product));
  };

  const addProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy("new-product");
    setError(null);
    setNotice(null);
    try {
      const product = await api<Product>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify({ ...newProduct, price: Number(newProduct.price), stock_quantity: Number(newProduct.stock_quantity) }),
      });
      setProducts((current) => [...current, product]);
      setNewProduct({ name: "", price: "", stock_quantity: "20", image: "/merch/indie-shirt-white.webp", description: "" });
      setNotice(`Đã thêm ${product.name}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thêm được sản phẩm.");
    } finally {
      setBusy(null);
    }
  };

  const updateOrder = async (order: Order, status: "done" | "cancel") => {
    setBusy(order.id);
    setError(null);
    setNotice(null);
    try {
      await api(`/api/admin/orders/${encodeURIComponent(order.id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setNotice(`Đã cập nhật ${order.order_code}.`);
      await loadData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không cập nhật được đơn hàng.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F2F0] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center bg-[#171717] text-white"><ShieldCheck className="size-5" /></div>
            <div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FF017E]">Indi Merch</p><h1 className="font-retroguard text-xl">QUẢN LÝ CỬA HÀNG</h1></div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden items-center gap-2 px-3 py-2 text-sm font-medium sm:flex"><ArrowLeft className="size-4" />Về cửa hàng</Link>
            {authenticated && <Button type="button" variant="outline" onClick={() => void logout()} className="gap-2"><LogOut className="size-4" /><span className="hidden sm:inline">Đăng xuất</span></Button>}
          </div>
        </div>
      </header>

      {!authenticated ? (
        <div className="mx-auto flex min-h-[75vh] max-w-md items-center px-4 py-12">
          <section className="w-full border border-black/10 bg-white p-7 shadow-sm md:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF017E]">Khu vực riêng</p>
            <h2 className="mt-2 font-retroguard text-3xl">ĐĂNG NHẬP ADMIN</h2>
            <p className="mt-3 text-sm leading-6 text-[#666]">Quản lý sản phẩm, tồn kho và đơn hàng merch.</p>
            {!configured ? (
              <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">Chưa cấu hình admin. Thêm <code>ADMIN_PASSWORD</code> và <code>ADMIN_SESSION_SECRET</code> vào <code>.env.local</code>, sau đó khởi động lại ứng dụng.</div>
            ) : (
              <form onSubmit={login} className="mt-6 space-y-4">
                <Field label="Mật khẩu admin" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" disabled={busy === "login"} className="h-11 w-full bg-[#FF017E] font-semibold text-white hover:bg-[#e90070]">{busy === "login" ? "ĐANG KIỂM TRA…" : "ĐĂNG NHẬP"}</Button>
              </form>
            )}
          </section>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF017E]">Tổng quan</p><h2 className="mt-1 font-retroguard text-3xl md:text-4xl">BẢNG ĐIỀU KHIỂN</h2></div>
            <Button type="button" variant="outline" onClick={() => void loadData()} disabled={loading} className="gap-2"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Làm mới</Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Tổng đơn hàng", value: metrics.orderCount, icon: ClipboardList },
              { label: "Đang chờ thanh toán", value: metrics.pending, icon: RefreshCw },
              { label: "Doanh thu đã thu", value: money(metrics.revenue), icon: Check },
              { label: "Sản phẩm đang bán", value: metrics.products, icon: Box },
            ].map((metric) => <div key={metric.label} className="border border-black/10 bg-white p-5"><div className="flex items-center justify-between text-xs font-semibold text-[#777]"><span>{metric.label}</span><metric.icon className="size-4 text-[#FF017E]" /></div><p className="mt-3 text-2xl font-bold">{metric.value}</p></div>)}
          </div>

          <div className="mt-7 flex gap-2 border-b border-black/15">
            <button type="button" onClick={() => setTab("orders")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === "orders" ? "border-[#FF017E] text-[#FF017E]" : "border-transparent text-[#666]"}`}><ClipboardList className="size-4" />Đơn hàng</button>
            <button type="button" onClick={() => setTab("products")} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === "products" ? "border-[#FF017E] text-[#FF017E]" : "border-transparent text-[#666]"}`}><Box className="size-4" />Sản phẩm & kho</button>
          </div>

          {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {notice && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

          {tab === "orders" ? (
            <section className="mt-5 space-y-3">
              {loading ? <div className="bg-white p-10 text-center text-sm text-[#777]">Đang tải đơn hàng…</div> : orders.length === 0 ? <div className="bg-white p-10 text-center text-sm text-[#777]">Chưa có đơn hàng nào.</div> : orders.map((order) => (
                <article key={order.id} className="border border-black/10 bg-white p-4 md:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold">{order.order_code}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.status === "done" ? "bg-green-100 text-green-800" : order.status === "init" || order.status === "in_progress" ? "bg-amber-100 text-amber-900" : "bg-gray-100 text-gray-600"}`}>{statusName[order.status] ?? order.status}</span></div>
                      <p className="mt-2 text-sm font-medium">{order.customer_name} · {order.customer_phone}</p>
                      <p className="text-sm text-[#666]">{order.customer_email}</p>
                      <p className="mt-1 text-xs text-[#888]">{order.customer_address || "Nhận tại cửa hàng"} · {new Date(order.created_at).toLocaleString("vi-VN")}</p>
                    </div>
                    <div className="text-left sm:text-right"><p className="text-xl font-bold text-[#FF017E]">{money(Number(order.total))}</p><p className="mt-1 text-xs text-[#777]">Tạm tính {money(Number(order.subtotal))} · Ship {money(Number(order.shipping_fee))}</p></div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 border-t border-[#EEE] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[#555]">{order.items.map((item) => `${item.merch_name}${[item.selected_color, item.selected_size, item.selected_type].filter(Boolean).length ? ` (${[item.selected_color, item.selected_size, item.selected_type].filter(Boolean).join(" / ")})` : ""} × ${item.quantity}`).join(" · ")}</p>
                    {(order.status === "init" || order.status === "in_progress") && <div className="flex shrink-0 gap-2"><Button type="button" variant="outline" disabled={busy === order.id} onClick={() => void updateOrder(order, "cancel")} className="border-red-200 text-red-700">Hủy đơn</Button><Button type="button" disabled={busy === order.id} onClick={() => void updateOrder(order, "done")} className="bg-[#171717] text-white hover:bg-black"><Check className="mr-2 size-4" />Xác nhận đã thu</Button></div>}
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="mt-5 space-y-5">
              <form onSubmit={addProduct} className="border border-black/10 bg-white p-4 md:p-5">
                <div className="mb-4 flex items-center gap-2"><PackagePlus className="size-5 text-[#FF017E]" /><h3 className="font-bold">Thêm sản phẩm</h3></div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Field label="Tên sản phẩm" value={newProduct.name} onChange={(event) => setNewProduct({ ...newProduct, name: event.target.value })} required />
                  <Field label="Giá (VND)" type="number" min="0" value={newProduct.price} onChange={(event) => setNewProduct({ ...newProduct, price: event.target.value })} required />
                  <Field label="Tồn kho" type="number" min="0" value={newProduct.stock_quantity} onChange={(event) => setNewProduct({ ...newProduct, stock_quantity: event.target.value })} required />
                  <Field label="Đường dẫn ảnh" value={newProduct.image} onChange={(event) => setNewProduct({ ...newProduct, image: event.target.value })} required />
                  <div className="flex items-end"><Button type="submit" disabled={busy === "new-product"} className="h-10 w-full bg-[#FF017E] text-white"><PackagePlus className="mr-2 size-4" />Thêm</Button></div>
                </div>
              </form>

              <div className="overflow-x-auto border border-black/10 bg-white">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-[#F7F6F5] text-xs uppercase tracking-wide text-[#777]"><tr><th className="px-4 py-3">Sản phẩm</th><th className="px-4 py-3">Giá</th><th className="px-4 py-3">Tồn kho</th><th className="px-4 py-3">Đang giữ</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3"></th></tr></thead>
                  <tbody className="divide-y divide-[#EEE]">
                    {loading ? <tr><td colSpan={6} className="p-8 text-center text-[#777]">Đang tải sản phẩm…</td></tr> : products.map((product) => <tr key={product.id}>
                      <td className="px-4 py-3"><input aria-label={`Tên ${product.id}`} value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} className="h-9 w-56 rounded border border-[#DDD] px-2" /><p className="mt-1 text-xs text-[#999]">{product.id}</p></td>
                      <td className="px-4 py-3"><input aria-label={`Giá ${product.name}`} type="number" min="0" value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })} className="h-9 w-28 rounded border border-[#DDD] px-2" /></td>
                      <td className="px-4 py-3"><input aria-label={`Tồn kho ${product.name}`} type="number" min={product.reserved_quantity} value={product.stock_quantity} onChange={(event) => updateProduct(product.id, { stock_quantity: Number(event.target.value) })} className="h-9 w-24 rounded border border-[#DDD] px-2" /></td>
                      <td className="px-4 py-3 text-[#666]">{product.reserved_quantity}</td>
                      <td className="px-4 py-3"><label className="flex items-center gap-2"><input type="checkbox" checked={product.active} onChange={(event) => updateProduct(product.id, { active: event.target.checked })} className="size-4 accent-[#FF017E]" />{product.active ? "Đang bán" : "Ẩn"}</label></td>
                      <td className="px-4 py-3 text-right"><Button type="button" variant="outline" size="sm" disabled={busy === product.id} onClick={() => void saveProduct(product)}><Save className="mr-2 size-4" />Lưu</Button></td>
                    </tr>)}
                  </tbody>
                </table>
              </div>
              <p className="text-xs leading-5 text-[#777]">Tồn kho là tổng số lượng. Số đang giữ được khóa cho đơn chờ thanh toán; không thể hạ tồn kho thấp hơn số đang giữ.</p>
            </section>
          )}
        </div>
      )}
    </main>
  );
}
