import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";

function getTicketPrice() {
  return ticket.price_sale ?? ticket.price_original;
}

export function TicketOptionCard({
  ticket,
  selected,
  disabled,
  quantity,
  effectiveMaxPerOrder,
  onDecrease,
  onIncrease,
}: TicketOptionCardProps) {
  const sortedTiers = [...ticket.discount_tiers].sort(
    (a, b) => a.min_quantity - b.min_quantity
  );

  // Only consider tiers that are within the available quantity range
  const applicableTiers = sortedTiers.filter(
    (tier) => tier.min_quantity <= effectiveMaxPerOrder
  );

  const activeTier = selected
    ? applicableTiers.findLast(
        (tier) => quantity >= tier.min_quantity
      ) ?? null
    : null;
  const nextTier = selected
    ? applicableTiers.find((tier) => quantity < tier.min_quantity) ?? null
    : null;
  const hasTierMessage =
    selected &&
    ((activeTier !== null && activeTier.discount_amount > 0) || nextTier !== null);

  return (
    <div className={`bg-[#171717] p-4 ${disabled ? "opacity-60" : ""}`}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="pt-2">
            <RadioGroupItem
              value={ticket.id}
              disabled={disabled}
              className="size-4 border-[#6C6C6C] bg-[#333333] data-checked:border-[#6C6C6C] data-checked:bg-[#333333] disabled:cursor-not-allowed"
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="flex-1">
                <p className="text-2xl font-semibold text-white">Vé {ticket.name}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-base leading-7 text-white">
                  {(ticket.benefits ?? "").split("\n").filter(Boolean).map((benefit) => (
                    <li key={benefit}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <div>
                  <p className="text-lg leading-7 text-[#60CAA4]">
                    {formatVnd(getTicketPrice(ticket), "VND")}
                  </p>
                  {ticket.price_sale ? (
                    <p className="text-sm leading-5 text-[#6C6C6C] line-through">
                      {formatVnd(ticket.price_original, "VND")}
                    </p>
                  ) : null}
                </div>

                {selected && !disabled ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onDecrease}
                      className="size-8 rounded-none border border-white bg-[#171717] p-0 text-white hover:bg-[#252525]"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.33325 8H12.6666"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                    <span className="inline-flex size-8 items-center justify-center rounded-md bg-[#171717] text-sm text-white">
                      {quantity.toString().padStart(2, "0")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onIncrease}
                      disabled={quantity >= effectiveMaxPerOrder}
                      className="size-8 rounded-none border border-white bg-[#171717] p-0 text-white hover:bg-[#252525] disabled:opacity-50"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.33325 8H12.6666M7.99992 3.33325V12.6666"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {hasTierMessage ? (
          <>
            <div className="h-px w-full bg-[#6C6C6C]" />
            <p className="text-base leading-6 text-[#60CAA4]">
              {activeTier !== null && activeTier.discount_amount > 0 ? (
                <>
                  Đã giảm thêm {formatVnd(activeTier.discount_amount, "VND")}
                  {nextTier !== null ? ", " : ""}
                </>
              ) : null}
              {nextTier !== null ? (
                <>
                  {activeTier !== null && activeTier.discount_amount > 0 ? "mua" : "Mua"}{" "}
                  thêm {nextTier.min_quantity - quantity} vé nữa để được giảm thêm{" "}
                  {formatVnd(nextTier.discount_amount - (activeTier?.discount_amount || 0), "VND")}
                </>
              ) : null}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
