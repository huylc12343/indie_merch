"use client";

import { useEffect, useState } from "react";
import type { MerchItem } from "@/lib/types";
import { DEMO_MODE, getMockCatalog } from "@/lib/mock-store";
import MerchInfo from "./merchInfo";

export default function MerchCatalog({ initialItems }: { initialItems: MerchItem[] }) {
  const [items, setItems] = useState(initialItems);
  useEffect(() => {
    if (!DEMO_MODE) return;
    const update = () => setItems(getMockCatalog());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("focus", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("focus", update);
    };
  }, []);
  return items.map((item) => <MerchInfo key={item.id} item={item} />);
}
