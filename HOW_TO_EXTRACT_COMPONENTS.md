# How to Extract Real Component Code from Lovable

This guide walks you through extracting the actual component implementations from your locked Lovable project to replace the stub files.

## Current Status

✅ **Working:** Project structure, routing, configs, page skeletons
❌ **Stubs Only:** UI components, landing components, hooks, lib utilities

## Step-by-Step Extraction Guide

### 1. **Go to Lovable Code Editor**
Navigate to: https://lovable.dev/projects/f9873255-b4fa-4ad9-a634-8bd720a7cbab?view=codeEditor

### 2. **Find Components to Extract**
In the left sidebar file tree, expand:
- `src/components/ui/` → Extract all `.tsx` files
- `src/components/landing/` → Extract all `.tsx` files
- `src/hooks/` → Extract all `.ts` files
- `src/lib/` → Extract all `.ts` files

### 3. **Extract Each File**

For each file you need to extract:

#### Option A: Copy-Paste Method (Easiest)
1. Click the file in Lovable's sidebar to open it
2. Press `Ctrl+A` (or `Cmd+A` on Mac) to select all code
3. Press `Ctrl+C` (or `Cmd+C`) to copy
4. Open the corresponding stub file in your code editor
5. Replace the stub content with the real code
6. Save the file

#### Option B: Using Browser Developer Tools
1. Open the file in Lovable
2. Right-click on the code → "Inspect"
3. Find the Monaco editor text in DevTools
4. Copy the content
5. Paste into your stub file

#### Option C: Using Lovable's Download Feature
1. Click the file in Lovable
2. Look for a "Download" button in the top right
3. Download the file
4. Copy its contents to replace the stub

### 4. **File Extraction Checklist**

#### UI Components (`src/components/ui/`)
- [ ] `toaster.tsx` - Toast notification component
- [ ] `sonner.tsx` - Sonner toast library integration
- [ ] `tooltip.tsx` - Tooltip component with provider
- [ ] `dialog.tsx` (if exists) - Modal/dialog component
- [ ] `button.tsx` (if exists) - Button component
- [ ] Any other shadcn/ui components imported in App.tsx

#### Landing Components (`src/components/landing/`)
- [ ] `HeroSection.tsx` - Hero banner component
- [ ] `InputCard.tsx` - Input form card
- [ ] `FeatureHighlights.tsx` - Features display
- [ ] `HowItWorks.tsx` - Step-by-step guide
- [ ] `SocialProof.tsx` - Testimonials/social proof
- [ ] `BenefitsCarousel.tsx` - Benefits carousel
- [ ] `SecondaryCTA.tsx` - Secondary call-to-action
- [ ] `Footer.tsx` - Footer component
- [ ] `LoadingScreen.tsx` - Loading/splash screen
- [ ] `BackgroundIcons.tsx` - Decorative background icons

#### Hooks (`src/hooks/`)
- [ ] Any custom React hooks used in pages
- [ ] Look at ArticleInput.tsx, CaptionEditor.tsx, etc. to see what hooks are imported

#### Lib (`src/lib/`)
- [ ] `supabase.ts` - Supabase client configuration
- [ ] `utils.ts` (if exists) - Utility functions
- [ ] Any other utility modules

### 5. **Import/Export Fixes**

After extracting each file, you may need to update imports:

**Before extracting:**
```typescript
// Lovable uses @ aliases
import { someComponent } from "@/components/ui/button"
```

**After extracting:**
The imports should already be correct if you copy the files as-is. The `@/` alias is configured in:
- `vite.config.ts` (already has the resolve alias)
- `tsconfig.json` (already has path mappings)

### 6. **Test After Each Component**

After extracting a few components:
```bash
npm install  # If needed
npm run dev  # Start dev server
```

Check the browser console for any remaining import errors and extract those files next.

### 7. **Common Issues & Solutions**

**Issue:** "Cannot find module '@/lib/supabase'"
- **Solution:** Extract `src/lib/supabase.ts` from Lovable

**Issue:** "Component 'X' is not exported"
- **Solution:** Check the Lovable file to see what's exported
- Add `export` keyword if missing
- Update the import if the component name is different

**Issue:** Missing dependencies
- **Solution:** Check `package.json` - most should already be installed
- Run `npm install` to add any missing packages

### 8. **Batch Extraction Tips**

If you have many files:
1. Open multiple files in Lovable tabs
2. Switch between tabs and copy-paste each one
3. This is faster than clicking in/out of folders

Alternative: Use Lovable's "Reference file in chat" feature to copy code snippets:
1. Click "Reference file in chat" button next to a file
2. Copy the code from Lovable's chat output
3. Paste into your stub file

## After All Files Are Extracted

1. Run `npm run dev` to start the development server
2. Check browser console for any remaining errors
3. Test each page to ensure components render correctly
4. Run `npm run build` to check for TypeScript errors
5. Commit your changes:
   ```bash
   git add src/components src/hooks src/lib
   git commit -m "Replace stub components with real implementations from Lovable"
   git push
   ```

## Need Help?

If you get stuck on a specific component:
1. Check how it's used in the pages (e.g., ArticleInput.tsx)
2. Look at the props it receives
3. The implementation should match those props

## Timeline

- **Quick test:** 5 minutes (extract 2-3 key components)
- **Full extraction:** 30-45 minutes (all components and utilities)
- **Recommended:** Start with UI components first, then landing components
