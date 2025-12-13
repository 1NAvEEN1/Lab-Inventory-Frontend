# ConfirmDialog Component

A reusable confirmation dialog component for displaying confirmation prompts throughout the application.

## Features

- Multiple variants (warning, error, info, success)
- Customizable title, message, and button text
- Loading state support
- Icon-based visual feedback
- Backdrop styling
- Custom content support via children prop

## Usage

### Basic Example

```jsx
import ConfirmDialog from "../../components/ConfirmDialog";

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    // Perform action
    console.log("Confirmed!");
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>Delete Item</Button>
      
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item?"
        confirmText="Delete"
        confirmColor="error"
        variant="warning"
      />
    </>
  );
}
```

### With Custom Content

```jsx
<ConfirmDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  title="Confirm Action"
  message="This action cannot be undone."
  variant="error"
>
  <Alert severity="warning" sx={{ mt: 2 }}>
    This will permanently delete all associated data.
  </Alert>
</ConfirmDialog>
```

### With Loading State

```jsx
const [loading, setLoading] = useState(false);

const handleConfirm = async () => {
  setLoading(true);
  try {
    await someAsyncOperation();
    setOpen(false);
  } finally {
    setLoading(false);
  }
};

<ConfirmDialog
  open={open}
  onClose={() => setOpen(false)}
  onConfirm={handleConfirm}
  loading={loading}
  title="Processing"
  message="Please wait..."
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Controls dialog visibility |
| `onClose` | `function` | required | Called when dialog is closed |
| `onConfirm` | `function` | required | Called when user confirms |
| `title` | `string` | `"Confirm Action"` | Dialog title |
| `message` | `string` | `"Are you sure you want to proceed?"` | Dialog message/content |
| `confirmText` | `string` | `"Confirm"` | Text for confirm button |
| `cancelText` | `string` | `"Cancel"` | Text for cancel button |
| `confirmColor` | `string` | `"primary"` | Color of confirm button (primary, error, warning, etc.) |
| `variant` | `string` | `"warning"` | Dialog variant: "warning", "error", "info", "success" |
| `children` | `ReactNode` | - | Additional content to display in dialog |
| `loading` | `boolean` | `false` | Shows loading state on confirm button |

## Variants

### Warning (default)
Used for potentially destructive actions that require confirmation.

### Error
Used for critical or dangerous actions.

### Info
Used for informational confirmations.

### Success
Used for positive confirmations.

## Replacing window.confirm

Instead of using the native browser `window.confirm()`:

```jsx
// ❌ Old way
if (window.confirm("Are you sure?")) {
  deleteItem();
}
```

Use the ConfirmDialog component:

```jsx
// ✅ New way
<ConfirmDialog
  open={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  onConfirm={handleDelete}
  title="Confirm Deletion"
  message="Are you sure you want to delete this item?"
/>
```

## Best Practices

1. Always provide descriptive titles and messages
2. Choose the appropriate variant for the action type
3. Use confirmColor to match the action (e.g., "error" for delete actions)
4. Include loading state for async operations
5. Close the dialog after successful confirmation
6. Handle errors gracefully within the onConfirm handler
