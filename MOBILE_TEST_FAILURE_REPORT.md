# Mobile Blog Test Failure Report
**Date:** 2026-07-11  
**Test:** `blog mobile controls remain reachable`  
**File:** `tests/mobile-ux.spec.mjs:116:3`  
**Status:** 🔴 FAILED  
**Viewport:** 390px × 844px (iPhone SE mobile)

---

## Executive Summary

The mobile blog page test failed because the **search textbox is not visible on mobile devices** at viewport 390px width. The test expects to find a textbox with the accessible label "Search blog articles", but:

1. ✅ The component **exists** in the code with correct `aria-label`
2. ❌ The component is **hidden or not rendered** on mobile viewport
3. ❌ The test **cannot find the element** within 15 seconds timeout

---

## Root Cause Analysis

### 1. **Missing Search Control on Mobile**

**File:** `altftoolweb/src/app/blogs/components/BlogExplorerClient.jsx` (Lines 224-249)

The `SearchControl` component exists but is **NOT rendered in the mobile layout**. The search toolbar section (lines 824-849) is missing the search input on smaller viewports.

**Current Code (BROKEN):**
```jsx
// Line 824-849: Toolbar section
<div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex flex-wrap gap-3">
    <Link href="#blog-explorer" ...>
      Explore guides
    </Link>
    {/* Search control NOT here */}
  </div>
  
  {stats && (
    <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
      {/* Stats only */}
    </div>
  )}
</div>
```

**Problem:** The `SearchControl` component is defined (lines 224-249) but **never rendered anywhere** in the JSX, especially not in the mobile-visible toolbar section.

### 2. **Test Expectations vs Reality**

**Test File:** `tests/mobile-ux.spec.mjs:120`
```javascript
await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
```

**What exists:** `<input aria-label="Search blog articles" />` in `SearchControl` component  
**What's missing:** This component is never mounted/rendered in the page

### 3. **Responsive Design Gap**

Looking at the layout structure:
- Desktop: 3-column grid layout with search in left/main column
- Mobile (390px): Same 3-column layout with collapsed content
- **Issue:** Search control completely disappears; should be visible on ALL viewports

---

## Impact Analysis

| Component | Status | Impact |
|-----------|--------|--------|
| Blog index page renders | ✅ Yes | Users can see blog page |
| Main content loads | ✅ Yes | Posts are visible |
| Search functionality | ❌ Missing | Users cannot search blogs on mobile |
| Sort/Filter controls | ⚠️ Possibly broken | May also be hidden |
| Categories widget | ✅ Probably visible | Sidebar shows on mobile |
| Quick access widget | ✅ Probably visible | Sidebar shows on mobile |

---

## Test Failure Details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('textbox', { name: 'Search blog articles' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call stack:
  Line 120: await expect(page.getByRole("textbox", { name: "Search blog articles" })).toBeVisible();
  At: /home/runner/work/altftool/altftool/tests/mobile-ux.spec.mjs:120:79
```

---

## Fix Strategy

### Solution: Render SearchControl in the Toolbar

**File to modify:** `altftoolweb/src/app/blogs/components/BlogExplorerClient.jsx`

**Change:** Add the search input to the toolbar section so it's visible on ALL viewports.

---

## Immediate Fix (Apply Now)

### Step 1: Update BlogExplorerClient.jsx

Replace lines 820-850 with the corrected toolbar that includes the search control:

```jsx
return (
  <section id="blog-explorer" className="mt-8">
    {heroShortcutRail && <div className="mb-8 -mt-4">{heroShortcutRail}</div>}

    {/* Toolbar: Search, Actions & Stats */}
    <div className="mb-8 flex flex-col gap-4 sm:gap-6">
      {/* Search Control - NOW VISIBLE ON ALL VIEWPORTS */}
      <div className="w-full sm:max-w-sm">
        <SearchControl 
          value={query}
          onChange={handleQueryChange}
          onClear={clearQuery}
          pending={isPending}
        />
      </div>

      {/* Actions & Stats Row */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link
            href="#blog-explorer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
          >
            Explore guides
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blogs/topics"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 text-sm font-bold text-(--foreground) transition hover:border-(--ans[...]"
          >
            Topic clusters
            <Layers3 className="h-4 w-4" />
          </Link>
        </div>

        {stats && (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
            <StatCard value={stats.posts || 31} label="Articles" />
            <StatCard value={stats.categories || 5} label="Categories" />
            <StatCard value={stats.tools || 31} label="Tools" />
          </div>
        )}
      </div>
    </div>

    {/* Rest of component... */}
```

### Step 2: Update SearchControl Styling for Mobile

Update lines 225-227 to be fully responsive:

```jsx
function SearchControl({ value, onChange, onClear, pending }) {
  return (
    <div className="relative w-full sm:min-w-[240px] sm:max-w-sm flex-1">
      {/* Rest of SearchControl... */}
    </div>
  );
}
```

### Step 3: Add Sort Control to Toolbar (Already missing!)

The `SortSelect` component (lines 203-222) is also not rendered. Add it after SearchControl:

```jsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
  <SearchControl 
    value={query}
    onChange={handleQueryChange}
    onClear={clearQuery}
    pending={isPending}
  />
  <SortSelect 
    value={sortMode}
    onChange={handleSortChange}
  />
</div>
```

---

## Complete Fixed Code

Here's the corrected toolbar section (lines 819-850):

```jsx
return (
  <section id="blog-explorer" className="mt-8">
    {heroShortcutRail && <div className="mb-8 -mt-4">{heroShortcutRail}</div>}

    {/* Toolbar: Search, Sort & Actions */}
    <div className="mb-8 flex flex-col gap-4 sm:gap-6">
      {/* Search & Sort Row - Responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <SearchControl 
          value={query}
          onChange={handleQueryChange}
          onClear={clearQuery}
          pending={isPending}
        />
        <SortSelect 
          value={sortMode}
          onChange={handleSortChange}
        />
      </div>

      {/* Actions & Stats Row */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <Link
            href="#blog-explorer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) transition hover:bg-(--primary-hover)"
          >
            Explore guides
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/blogs/topics"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-(--border) bg-(--card) px-5 text-sm font-bold text-(--foreground) transition hover:border-(--ans[...]"
          >
            Topic clusters
            <Layers3 className="h-4 w-4" />
          </Link>
        </div>

        {stats && (
          <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0">
            <StatCard value={stats.posts || 31} label="Articles" />
            <StatCard value={stats.categories || 5} label="Categories" />
            <StatCard value={stats.tools || 31} label="Tools" />
          </div>
        )}
      </div>
    </div>

    {/* Featured & Trending Row */}
    {featuredPosts?.length > 0 && (
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ... rest of code ... */}
      </div>
    )}
    
    {/* ... rest of component ... */}
  </section>
);
```

---

## Verification Steps

After applying the fix, verify:

1. **Search box appears on mobile:**
   ```bash
   npm run test -- tests/mobile-ux.spec.mjs --grep "blog mobile controls"
   ```

2. **Search box appears on desktop:** Visit `/blogs` in browser at 1024px width

3. **Sort dropdown visible:** Both mobile and desktop

4. **Horizontal overflow check:** Ensure nothing breaks the 390px viewport width

5. **All tests pass:**
   ```bash
   npm run test -- tests/mobile-ux.spec.mjs
   npm run test -- tests/blog-mobile-engagement.spec.mjs
   npm run test -- tests/keyboard-accessibility.spec.mjs
   ```

---

## Additional Observations

### Other Potentially Missing Controls

Review these also not rendered:
- ✅ `CategoryTabs` - rendered (lines 166-201) ❌ Actually NOT in JSX
- ✅ `SortSelect` - defined but NOT rendered anywhere
- ✅ `SearchControl` - defined but NOT rendered anywhere

Recommendation: Verify entire toolbar section is complete.

### Mobile Layout Dimensions

- **Test viewport:** 390px (iPhone SE)
- **SearchControl width:** 240px min, fits within 390px viewport
- **Ensure:** No horizontal overflow when search is visible

---

## Files to Modify

| File | Lines | Change | Priority |
|------|-------|--------|----------|
| `altftoolweb/src/app/blogs/components/BlogExplorerClient.jsx` | 819-850 | Add SearchControl & SortSelect to toolbar | 🔴 CRITICAL |
| `tests/mobile-ux.spec.mjs` | 120 | Test should pass after fix | AUTO |

---

## Expected Outcome

✅ Test will pass because:
1. Search textbox with `aria-label="Search blog articles"` will be rendered
2. Will be visible at 390px viewport width
3. Will have proper responsive styling
4. Will maintain horizontal overflow compliance

---

## Timeline

- **Apply fix:** Immediately
- **Run tests:** 2-3 minutes
- **Deploy:** Next build cycle
