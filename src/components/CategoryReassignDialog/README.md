# CategoryReassignDialog Component

A specialized dialog component for reassigning items to a new category before deletion.

## Features

- Category selection via ParentCategorySelector
- Automatic exclusion of the category being deleted
- Visual warning alert
- Loading state support
- Disabled submit until category is selected

## Usage

### Basic Example

```jsx
import CategoryReassignDialog from "../../components/CategoryReassignDialog";

function MyComponent() {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleReassignAndDelete = async (newCategoryId) => {
    try {
      setDeleting(true);
      await CategoriesService.delete(categoryId, {
        newCategoryId: Number(newCategoryId),
      });
      showAlertMessage({
        message: "Category deleted successfully",
        type: "success",
      });
      navigate("/inventory/categories");
    } catch (err) {
      showAlertMessage({
        message: "Failed to delete category",
        type: "error",
      });
    } finally {
      setDeleting(false);
      setOpen(false);
    }
  };

  return (
    <CategoryReassignDialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={handleReassignAndDelete}
      categoryName="Electronics"
      currentCategoryId="123"
      loading={deleting}
    />
  );
}
```

### Integration with Delete Flow

```jsx
const handleDelete = () => {
  // First show a confirmation dialog
  setDeleteConfirmOpen(true);
};

const handleDeleteConfirm = () => {
  // Close first dialog and open reassign dialog
  setDeleteConfirmOpen(false);
  setReassignDialogOpen(true);
};

const handleReassignAndDelete = async (newCategoryId) => {
  // Process deletion with new category ID
  await CategoriesService.delete(viewId, {
    newCategoryId: Number(newCategoryId),
  });
};

return (
  <>
    <Button onClick={handleDelete}>Delete</Button>
    
    <ConfirmDialog
      open={deleteConfirmOpen}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={handleDeleteConfirm}
      title="Delete Category"
      message="This category may have items. Do you want to proceed?"
    />
    
    <CategoryReassignDialog
      open={reassignDialogOpen}
      onClose={() => setReassignDialogOpen(false)}
      onConfirm={handleReassignAndDelete}
      categoryName={name}
      currentCategoryId={viewId}
      loading={deleting}
    />
  </>
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | required | Controls dialog visibility |
| `onClose` | `function` | required | Called when dialog is closed |
| `onConfirm` | `function` | required | Called with selected category ID when confirmed |
| `categoryName` | `string` | `""` | Name of the category being deleted |
| `currentCategoryId` | `string/number` | `null` | ID of the category being deleted (excluded from selector) |
| `loading` | `boolean` | `false` | Shows loading state on confirm button |

## API Payload

The dialog passes the selected category ID to the `onConfirm` callback. Your API endpoint should accept:

```json
{
  "newCategoryId": 5
}
```

Example API call:
```javascript
await CategoriesService.delete(categoryId, {
  newCategoryId: Number(newCategoryId),
});
```

## Features

### Automatic Category Exclusion
The dialog automatically excludes the category being deleted from the selection list to prevent invalid assignments.

### Validation
The "Delete & Reassign" button is disabled until a valid category is selected.

### State Management
The dialog manages its own internal state for the selected category and resets on close.

### Loading State
Shows "Deleting..." text on the button when loading prop is true, and disables all interactions.

## Best Practices

1. Always provide the current category name for context
2. Pass the correct currentCategoryId to exclude it from selection
3. Handle loading state properly to prevent double-submissions
4. Show success/error messages after the operation completes
5. Navigate away or refresh data after successful deletion
6. Reset the dialog state on close
