<!-- BEGIN:nextjs-agent-rules -->

# Environment
This is a Next.js App Router project using:
- Tailwind CSS (v4, CSS-first config)
- shadcn/ui (Radix UI + Tailwind)
- TypeScript

# UI Rules (IMPORTANT)
- ALWAYS use Tailwind CSS for styling
- DO NOT write custom CSS unless absolutely necessary
- Prefer utility classes over inline styles

# shadcn/ui Rules
- ALWAYS use components from "@/components/ui/*" when available
- Do NOT recreate components like Button, Input, Dialog manually
- Use variants and className overrides instead of rewriting components
- Follow shadcn patterns (composition over customization)

# Styling Conventions
- Use semantic spacing: px-4, py-2, gap-4
- Use Tailwind typography: text-sm, text-base, font-semibold
- Use design tokens: bg-background, text-foreground, border-border
- Respect theme variables (do not hardcode colors unless needed)

# Layout Rules
- Use flex/grid via Tailwind
- Keep components small and reusable
- Prefer composition instead of deeply nested divs

# Icons
- Use lucide-react for icons

# Fonts
- Use Geist via CSS variables
- Default font must be `font-sans`

# Bad Practices (AVOID)
- ❌ Writing plain CSS files for UI
- ❌ Inline style={{}} unless dynamic
- ❌ Rebuilding UI components already in shadcn
- ❌ Hardcoding colors instead of theme tokens

# Good Practices
- ✅ <Button variant="secondary" />
- ✅ <Sheet /> for cart drawer
- ✅ <Dialog /> for modal
- ✅ Tailwind utility-first styling

# Component Preference Order
1. shadcn/ui
2. Tailwind utilities
3. Custom component (only if needed)

<!-- END:nextjs-agent-rules -->