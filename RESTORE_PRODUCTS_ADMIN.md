# Restore ProductsAdmin Full Functionality

## 🎯 Purpose
Once the database schema is fixed (missing columns added), this guide will help restore the ProductsAdmin component to its full functionality.

## 📋 Steps to Restore

### 1. Update ProductFormData Interface
```typescript
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;        // RESTORE THIS
  stock_quantity: number;
  compare_price: number;       // RESTORE THIS
  sort_order: number;
  meta_title: string;          // RESTORE THIS
  meta_description: string;    // RESTORE THIS
  labels: string[];            // RESTORE THIS
}
```

### 2. Restore Form Data Initialization
```typescript
const [formData, setFormData] = useState<ProductFormData>({
  name: '',
  description: '',
  price: 0,
  category_id: '',
  image_url: '',
  is_active: true,
  is_featured: false,          // RESTORE THIS
  stock_quantity: 0,
  compare_price: 0,            // RESTORE THIS
  sort_order: 0,
  meta_title: '',              // RESTORE THIS
  meta_description: '',        // RESTORE THIS
  labels: []                   // RESTORE THIS
});
```

### 3. Restore Form Reset Function
```typescript
setFormData({
  name: '',
  description: '',
  price: 0,
  category_id: '',
  image_url: '',
  is_active: true,
  is_featured: false,          // RESTORE THIS
  stock_quantity: 0,
  compare_price: 0,            // RESTORE THIS
  sort_order: 0,
  meta_title: '',              // RESTORE THIS
  meta_description: '',        // RESTORE THIS
  labels: []                   // RESTORE THIS
});
```

### 4. Restore Edit Product Function
```typescript
setFormData({
  name: product.name || '',
  description: product.description || '',
  price: product.price || 0,
  category_id: product.category_id || '',
  image_url: product.image_url || '',
  is_active: product.is_active ?? true,
  is_featured: product.is_featured ?? false,        // RESTORE THIS
  stock_quantity: product.stock_quantity || 0,
  compare_price: product.compare_price || 0,        // RESTORE THIS
  sort_order: product.sort_order || 0,
  meta_title: product.meta_title || '',             // RESTORE THIS
  meta_description: product.meta_description || '', // RESTORE THIS
  labels: (product as any).labels || []             // RESTORE THIS
});
```

### 5. Restore Product Data Preparation
```typescript
const productData = {
  ...formData,
  price: Number(formData.price),
  stock_quantity: Number(formData.stock_quantity),
  compare_price: Number(formData.compare_price),    // RESTORE THIS
  sort_order: Number(formData.sort_order),
};
```

### 6. Restore toggleFeatured Function
```typescript
const toggleFeatured = (product: DatabaseProduct) => {
  updateProductMutation.mutate({
    id: product.id,
    is_featured: !product.is_featured
  });
};
```

### 7. Restore Form Fields

#### Compare Price Field
```typescript
<div className="space-y-1 md:space-y-2">
  <Label htmlFor="compare_price" className="text-sm font-medium">Compare Price (€)</Label>
  <Input
    id="compare_price"
    type="number"
    step="0.01"
    min="0"
    value={formData.compare_price}
    onChange={(e) => setFormData(prev => ({ ...prev, compare_price: parseFloat(e.target.value) || 0 }))}
    className="text-sm md:text-base"
  />
</div>
```

#### SEO Fields
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
  <div className="space-y-1 md:space-y-2">
    <Label htmlFor="meta_title" className="text-sm font-medium">Meta Title (SEO)</Label>
    <Input
      id="meta_title"
      value={formData.meta_title}
      onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
      placeholder="SEO title"
      className="text-sm md:text-base"
    />
  </div>
  <div className="space-y-1 md:space-y-2">
    <Label htmlFor="meta_description" className="text-sm font-medium">Meta Description (SEO)</Label>
    <Input
      id="meta_description"
      value={formData.meta_description}
      onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
      placeholder="SEO description"
      className="text-sm md:text-base"
    />
  </div>
</div>
```

#### Labels Management
```typescript
<LabelsManager
  labels={formData.labels}
  onChange={(labels) => setFormData(prev => ({ ...prev, labels }))}
  placeholder="Add a label (e.g., lauree, matrimoni, compleanno)"
/>
```

#### Featured Toggle
```typescript
<div className="flex items-center space-x-2">
  <Switch
    id="is_featured"
    checked={formData.is_featured}
    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
  />
  <Label htmlFor="is_featured" className="text-sm font-medium">Featured</Label>
</div>
```

### 8. Restore Product List Features

#### Featured Badge
```typescript
{product.is_featured && (
  <Badge variant="secondary" className="text-xs">
    Featured
  </Badge>
)}
```

#### Labels Display
```typescript
{(product as any).labels && (product as any).labels.length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {(product as any).labels.map((label: string, index: number) => (
      <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
        <Tag className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    ))}
  </div>
)}
```

#### Featured Toggle Button
```typescript
<Button
  variant="ghost"
  size="sm"
  onClick={() => toggleFeatured(product)}
  title={product.is_featured ? 'Remove from featured' : 'Add to featured'}
  className="h-8 w-8 md:h-9 md:w-9"
>
  {product.is_featured ? (
    <Star className="h-3 w-3 md:h-4 md:w-4 fill-current text-yellow-500" />
  ) : (
    <StarOff className="h-3 w-3 md:h-4 md:w-4" />
  )}
</Button>
```

### 9. Restore Import
```typescript
import LabelsManager from './LabelsManager';
```

## ✅ Verification Steps

1. **Test Schema**: Use "Schema Fix" tab to verify all columns exist
2. **Restore Code**: Apply all the above changes to ProductsAdmin.tsx
3. **Test Creation**: Try creating a product with all fields
4. **Test Features**: Test featured toggle, labels, SEO fields
5. **Verify Frontend**: Check that products display correctly

## 🎉 Result
Full ProductsAdmin functionality restored with:
- ✅ Compare pricing
- ✅ SEO optimization fields
- ✅ Product labels/tags
- ✅ Featured products
- ✅ Complete admin interface
