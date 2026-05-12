// "use client";

// import { useState } from "react";
// import { CopyIcon, XIcon } from "lucide-react";
// import { QRCodeSVG } from "qrcode.react";
// import { toast } from "sonner";
// import { Button } from "@/components/ui/button";
// // import { useExpirationCountdown } from "@/hooks/use-expiration-countdown";
// import type { CreateOrderResponse } from "@/lib/api";
// import { cn } from "@/lib/utils";

// type PaymentModalProps = {
//   open: boolean;
//   order: CreateOrderResponse | null;
//   bankName: string | null;
//   onClose: () => void;
// };

// type PaymentTab = "qr" | "transfer";

// function PaymentTabButton({
//   active,
//   children,
//   onClick,
// }: {
//   active: boolean;
//   children: string;
//   onClick: () => void;
// }) {
//   return (
//     <Button
//       type="button"
//       onClick={onClick}
//       className={cn(
//         "h-auto flex-1 rounded-[8px] px-3 py-2 text-sm font-medium transition-colors",
//         active
//           ? "bg-[#FF017E] text-white shadow-[0px_1px_3px_rgba(0,0,0,0.10)] hover:bg-[#FF017E]"
//           : "bg-transparent text-black hover:bg-white",
//       )}
//     >
//       {children}
//     </Button>
//   );
// }

// function PaymentStep({
//   number,
//   children,
// }: {
//   number: number;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex items-center gap-4">
//       <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#FF017E] text-base font-semibold text-white">
//         {number}
//       </div>
//       <div className="text-sm leading-4 text-black">{children}</div>
//     </div>
//   );
// }

// // function PaymentCountdown({ expiresAt }: { expiresAt: string }) {
// //   const { minutes, seconds } = useExpirationCountdown({ expiresAt });

// //   return (
// //     <div className="flex items-center justify-between gap-4 rounded-[10px] bg-[#F5F5F5] px-3 py-2">
// //       <p className="text-xs leading-4 text-black">Giao dịch sẽ kết thúc sau</p>
// //       <div className="flex items-center gap-1">
// //         <div className="flex size-8 items-center justify-center rounded-[8px] bg-[#171717] text-sm text-white">
// //           {minutes.toString().padStart(2, "0")}
// //         </div>
// //         <span className="text-sm text-black">:</span>
// //         <div className="flex size-8 items-center justify-center rounded-[8px] bg-[#171717] text-sm text-white">
// //           {seconds.toString().padStart(2, "0")}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// function CopyField({
//   label,
//   displayValue,
//   copyValue,
// }: {
//   label: string;
//   displayValue: string;
//   copyValue: string;
// }) {
//   const handleCopy = async () => {
//     try {
//       await navigator.clipboard.writeText(copyValue);
//       toast.success("Đã sao chép thông tin.", { position: "top-center" });
//     } catch {
//       toast.error("Không thể sao chép thông tin.", { position: "top-center" });
//     }
//   };

//   return (
//     <div className="flex items-start justify-between gap-3">
//       <div className="min-w-0 space-y-2">
//         <p className="text-xs leading-4 text-[#6C6C6C]">{label}</p>
//         <p className="break-all text-sm leading-6 text-black">{displayValue}</p>
//       </div>
//       <Button
//         type="button"
//         onClick={handleCopy}
//         variant="ghost"
//         size="icon"
//         className="size-8 shrink-0 rounded-[8px] text-[#FF017E] hover:bg-white"
//         aria-label={`Sao chép ${label.toLowerCase()}`}
//       >
//         <CopyIcon className="size-4" />
//       </Button>
//     </div>
//   );
// }

// export function PaymentModal({
//   open,
//   order,
//   bankName,
//   onClose,
// }: PaymentModalProps) {
//   const [activeTab, setActiveTab] = useState<PaymentTab>("qr");

//   if (!open || !order) {
//     return null;
//   }

//   const transferFields = [
//     {
//       label: "Tên ngân hàng",
//       displayValue: bankName ?? order.payment_info.bin,
//       copyValue: bankName ?? order.payment_info.bin,
//     },
//     {
//       label: "Tên tài khoản",
//       displayValue: order.payment_info.account_name,
//       copyValue: order.payment_info.account_name,
//     },
//     {
//       label: "Số tài khoản",
//       displayValue: order.payment_info.account_number,
//       copyValue: order.payment_info.account_number,
//     },
//     {
//       label: "Số tiền",
//       displayValue: new Intl.NumberFormat("vi-VN").format(
//         order.payment_info.amount,
//       ),
//       copyValue: order.payment_info.amount.toString(),
//     },
//     {
//       label: "Nội dung chuyển khoản",
//       displayValue: order.payment_info.description,
//       copyValue: order.payment_info.description,
//     },
//   ];

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
//       onClick={onClose}
//     >
//       <div
//         className="inline-flex w-full max-w-[800px] flex-col items-center gap-6 rounded-[12px] bg-white p-4 lg:p-8"
//         onClick={(event) => event.stopPropagation()}
//       >
//         <div className="flex w-full items-center justify-between gap-4">
//           <p className="font-heading text-[32px] leading-12 text-[#FF017E]">
//             THANH TOÁN
//           </p>
//           <Button
//             type="button"
//             onClick={onClose}
//             variant="ghost"
//             size="icon"
//             className="size-8 rounded-[8px] text-black hover:bg-[#F5F5F5]"
//             aria-label="Đóng modal thanh toán"
//           >
//             <XIcon className="size-5" />
//           </Button>
//         </div>

//         <div className="flex w-full items-center gap-2 rounded-[10px] bg-[#F5F5F5] px-2 py-1">
//           <PaymentTabButton
//             active={activeTab === "qr"}
//             onClick={() => setActiveTab("qr")}
//           >
//             Mã QR
//           </PaymentTabButton>
//           <PaymentTabButton
//             active={activeTab === "transfer"}
//             onClick={() => setActiveTab("transfer")}
//           >
//             Chuyển khoản
//           </PaymentTabButton>
//         </div>

//         <div className="w-full">
//           {activeTab === "qr" ? (
//             <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-stretch lg:gap-6">
//               <div className="flex w-full flex-col gap-5 rounded-[10px] bg-[#F5F5F5] p-5 lg:h-full lg:w-[240px]">
//                 <div className="flex items-center justify-center rounded-[10px] bg-white p-3">
//                   <QRCodeSVG
//                     value={order.payment_info.qr_code}
//                     size={184}
//                     bgColor="#FFFFFF"
//                     fgColor="#000000"
//                     marginSize={2}
//                   />
//                 </div>
//                 <div className="flex items-center justify-between gap-4 text-sm leading-6 text-black">
//                   <p>Tổng tiền</p>
//                   <p>
//                     {new Intl.NumberFormat("vi-VN").format(
//                       order.payment_info.amount,
//                     )}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex h-full flex-1 flex-col gap-5">
//                 <div className="space-y-6">
//                   <p className="text-base font-bold leading-5 text-black">
//                     Hướng dẫn thanh toán
//                   </p>
//                   <div className="space-y-4">
//                     <PaymentStep number={1}>
//                       Chọn tính năng{" "}
//                       <span className="font-semibold">Quét mã QR</span> trên bất
//                       kỳ app Ngân hàng hay Ví điện tử mà bạn sử dụng
//                     </PaymentStep>
//                     <PaymentStep number={2}>Quét mã QR ở trang này</PaymentStep>
//                     <PaymentStep number={3}>
//                       Thực hiện thanh toán và xem kết quả giao dịch tại trang
//                       này (không tắt popup)
//                     </PaymentStep>
//                   </div>
//                 </div>

//                 {/* <PaymentCountdown expiresAt={order.expires_at ?? ""} /> */}
//               </div>
//             </div>
//           ) : (
//             <div className="flex w-full flex-col gap-6 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-stretch lg:gap-6">
//               <div className="w-full shrink-0 rounded-[10px] bg-[#F5F5F5] p-5 lg:h-full lg:w-[240px]">
//                 <div className="space-y-5">
//                   {transferFields.map((field) => (
//                     <CopyField
//                       key={field.label}
//                       label={field.label}
//                       displayValue={field.displayValue}
//                       copyValue={field.copyValue}
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="flex h-full flex-1 flex-col gap-5">
//                 <div className="space-y-6">
//                   <p className="text-base font-bold leading-5 text-black">
//                     Hướng dẫn thanh toán
//                   </p>
//                   <div className="space-y-4">
//                     <PaymentStep number={1}>
//                       Chọn tính năng{" "}
//                       <span className="font-semibold">Chuyển tiền</span> trên
//                       bất kỳ app Ngân hàng hay Ví điện tử mà bạn sử dụng
//                     </PaymentStep>
//                     <PaymentStep number={2}>
//                       Sao chép chính xác các nội dung được ghi ở bên trái.{" "}
//                       <span className="font-semibold">
//                         Lưu ý kiểm tra chính xác số tiền.
//                       </span>
//                     </PaymentStep>
//                     <PaymentStep number={3}>
//                       Thực hiện thanh toán và xem kết quả giao dịch tại trang
//                       này (không tắt popup)
//                     </PaymentStep>
//                   </div>
//                 </div>

//                 {/* <PaymentCountdown expiresAt={order.expires_at ?? ""} /> */}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
