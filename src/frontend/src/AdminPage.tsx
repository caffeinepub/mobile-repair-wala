import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Loader2,
  LogOut,
  PackagePlus,
  Phone,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "./backend.d";
import { UserRole } from "./backend.d";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useAddProduct,
  useAssignCallerUserRole,
  useDeleteProduct,
  useGetAllProducts,
  useIsCallerAdmin,
  useUpdateProduct,
} from "./hooks/useQueries";

/* ─── Product Form Modal ─────────────────────────────────── */
interface ProductFormData {
  name: string;
  category: string;
  price: string; // In ₹ (rupees), converted to paise on save
  imageUrl: string;
}

const defaultForm: ProductFormData = {
  name: "",
  category: "Accessories",
  price: "",
  imageUrl: "",
};

const CATEGORY_SUGGESTIONS = [
  "Accessories",
  "Chargers",
  "Audio",
  "Protection",
  "Cables",
  "Power Banks",
  "Speakers",
];

function ProductFormModal({
  open,
  onClose,
  editProduct,
}: {
  open: boolean;
  onClose: () => void;
  editProduct: Product | null;
}) {
  const isEditing = !!editProduct;
  const [form, setForm] = useState<ProductFormData>(() =>
    editProduct
      ? {
          name: editProduct.name,
          category: editProduct.category,
          price: (Number(editProduct.price) / 100).toString(),
          imageUrl: editProduct.imageUrl,
        }
      : defaultForm,
  );
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const isPending = addProduct.isPending || updateProduct.isPending;

  const validate = (): boolean => {
    const next: Partial<ProductFormData> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.category.trim()) next.category = "Category is required";
    const priceNum = Number.parseFloat(form.price);
    if (!form.price || Number.isNaN(priceNum) || priceNum <= 0)
      next.price = "Enter a valid price in ₹";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const priceInPaise = BigInt(
      Math.round(Number.parseFloat(form.price) * 100),
    );

    try {
      if (isEditing && editProduct) {
        await updateProduct.mutateAsync({
          id: editProduct.id,
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceInPaise,
          imageUrl: form.imageUrl.trim(),
        });
        toast.success("Product updated successfully!");
      } else {
        await addProduct.mutateAsync({
          name: form.name.trim(),
          category: form.category.trim(),
          price: priceInPaise,
          imageUrl: form.imageUrl.trim(),
        });
        toast.success("Product added successfully!");
      }
      onClose();
    } catch {
      toast.error(`Failed to ${isEditing ? "update" : "add"} product.`);
    }
  };

  const update = (field: keyof ProductFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="admin.dialog"
        className="glass-card border-border/40 max-w-md w-full"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-foreground flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-primary" />
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-name"
              className="text-foreground/80 text-sm"
            >
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              data-ocid="admin.product.input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Wireless Earphones"
              className="bg-muted/40 border-border/50 focus:border-primary/60"
            />
            {errors.name && (
              <p
                data-ocid="admin.product.error_state"
                className="text-destructive text-xs"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-category"
              className="text-foreground/80 text-sm"
            >
              Category <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-category"
              data-ocid="admin.category.input"
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="e.g. Accessories"
              list="category-suggestions"
              className="bg-muted/40 border-border/50 focus:border-primary/60"
            />
            <datalist id="category-suggestions">
              {CATEGORY_SUGGESTIONS.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {errors.category && (
              <p className="text-destructive text-xs">{errors.category}</p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-price"
              className="text-foreground/80 text-sm"
            >
              Price in ₹ (Rupees) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 font-bold text-sm">
                ₹
              </span>
              <Input
                id="product-price"
                data-ocid="admin.price.input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
                className="pl-7 bg-muted/40 border-border/50 focus:border-primary/60"
              />
            </div>
            {errors.price && (
              <p className="text-destructive text-xs">{errors.price}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label
              htmlFor="product-image"
              className="text-foreground/80 text-sm"
            >
              Image URL{" "}
              <span className="text-foreground/40 font-normal">(optional)</span>
            </Label>
            <Input
              id="product-image"
              data-ocid="admin.image.input"
              value={form.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-muted/40 border-border/50 focus:border-primary/60"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              data-ocid="admin.product.cancel_button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-border/50 hover:bg-muted/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="admin.product.submit_button"
              disabled={isPending}
              className="btn-neon-cyan border-0"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditing ? "Updating…" : "Adding…"}
                </>
              ) : (
                <>{isEditing ? "Update Product" : "Add Product"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Delete Confirm Dialog ──────────────────────────────── */
function DeleteConfirmDialog({
  open,
  productName,
  onConfirm,
  onCancel,
  isPending,
}: {
  open: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        data-ocid="admin.delete.dialog"
        className="glass-card border-border/40"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display font-bold text-foreground">
            Delete Product
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/60">
            Are you sure you want to delete{" "}
            <span className="text-foreground font-semibold">
              "{productName}"
            </span>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            data-ocid="admin.delete.cancel_button"
            onClick={onCancel}
            disabled={isPending}
            className="border-border/50 hover:bg-muted/50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-ocid="admin.delete.confirm_button"
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ─── Admin Dashboard ────────────────────────────────────── */
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { data: products, isLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Header */}
      <header className="border-b border-border/30 navbar-scrolled sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center pulse-glow">
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-display font-black text-base neon-text-cyan">
                Mobile Repair Wala
              </span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-primary" />
                <span className="text-[11px] font-semibold text-primary/80 tracking-wide uppercase">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            data-ocid="admin.logout.button"
            onClick={onLogout}
            className="border-border/50 hover:border-destructive/50 hover:text-destructive gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Page title row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl text-foreground">
              Product <span className="neon-text-purple">Management</span>
            </h1>
            <p className="text-sm text-foreground/50 mt-1">
              Add, edit, or remove accessories from your store.
            </p>
          </div>
          <Button
            data-ocid="admin.add.primary_button"
            onClick={() => setAddOpen(true)}
            className="btn-neon-cyan border-0 gap-2 font-bold"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </div>

        {/* Products Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          {isLoading ? (
            <div
              data-ocid="admin.products.loading_state"
              className="p-6 space-y-3"
            >
              {Array.from({ length: 5 }, (_, i) => `row-${i}`).map((k) => (
                <Skeleton key={k} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : !products || products.length === 0 ? (
            <div
              data-ocid="admin.products.empty_state"
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border/30 flex items-center justify-center mb-4">
                <PackagePlus className="w-8 h-8 text-foreground/30" />
              </div>
              <h3 className="font-display font-bold text-foreground/60 mb-1">
                No products yet
              </h3>
              <p className="text-sm text-foreground/40">
                Click "Add New Product" to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table data-ocid="admin.products.table">
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-foreground/50 font-semibold w-16">
                      Image
                    </TableHead>
                    <TableHead className="text-foreground/50 font-semibold">
                      Name
                    </TableHead>
                    <TableHead className="text-foreground/50 font-semibold hidden sm:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="text-foreground/50 font-semibold text-right">
                      Price
                    </TableHead>
                    <TableHead className="text-foreground/50 font-semibold text-right w-24">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, i) => (
                    <TableRow
                      key={product.id}
                      data-ocid={`admin.products.row.${i + 1}`}
                      className="border-border/20 hover:bg-muted/20 transition-colors"
                    >
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/50 border border-border/30 flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PackagePlus className="w-5 h-5 text-foreground/20" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge
                          variant="outline"
                          className="border-primary/30 text-primary/80 bg-primary/10 text-xs"
                        >
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        ₹{(Number(product.price) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            data-ocid={`admin.products.edit_button.${i + 1}`}
                            onClick={() => setEditProduct(product)}
                            className="w-8 h-8 hover:bg-primary/20 hover:text-primary"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            data-ocid={`admin.products.delete_button.${i + 1}`}
                            onClick={() => setDeleteTarget(product)}
                            className="w-8 h-8 hover:bg-destructive/20 hover:text-destructive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-foreground/30">
          <button
            type="button"
            data-ocid="admin.back.button"
            className="hover:text-primary transition-colors"
            onClick={() => {
              window.location.hash = "";
            }}
          >
            ← Back to Website
          </button>
        </div>
      </main>

      {/* Modals */}
      <ProductFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        editProduct={null}
      />
      {editProduct && (
        <ProductFormModal
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          editProduct={editProduct}
        />
      )}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        productName={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isPending={deleteProduct.isPending}
      />
    </div>
  );
}

/* ─── Admin Page (Auth Gate) ─────────────────────────────── */
export default function AdminPage() {
  const { login, clear, isInitializing, isLoggingIn, identity } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const assignRole = useAssignCallerUserRole();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const handleRequestAdmin = async () => {
    if (!identity) return;
    try {
      await assignRole.mutateAsync({
        principal: identity.getPrincipal(),
        role: UserRole.admin,
      });
      toast.success("Admin access granted! Refreshing…");
    } catch {
      toast.error("Failed to assign admin role.");
    }
  };

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground/50 text-sm">Initializing…</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        {/* Background ambient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
        </div>

        <div
          data-ocid="admin.login.card"
          className="glass-card rounded-2xl p-8 w-full max-w-sm text-center relative"
        >
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-5 pulse-glow">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>

          <h1 className="font-display font-black text-2xl text-foreground mb-1">
            Admin <span className="neon-text-cyan">Login</span>
          </h1>
          <p className="text-foreground/50 text-sm mb-6">
            Sign in with Internet Identity to access the admin panel.
          </p>

          <Button
            data-ocid="admin.login.primary_button"
            onClick={login}
            disabled={isLoggingIn}
            className="btn-neon-cyan border-0 w-full py-3 font-bold gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Login with Internet Identity
              </>
            )}
          </Button>

          <p className="text-xs text-foreground/30 mt-4">
            Secure, decentralized authentication on the Internet Computer
          </p>
        </div>
      </div>
    );
  }

  // Logged in but checking admin status
  if (isAdminLoading) {
    return (
      <div
        data-ocid="admin.loading_state"
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-foreground/50 text-sm">Checking permissions…</p>
        </div>
      </div>
    );
  }

  // Logged in but NOT admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-destructive/5 blur-3xl" />
        </div>

        <div
          data-ocid="admin.access_denied.card"
          className="glass-card rounded-2xl p-8 w-full max-w-sm text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>

          <h1 className="font-display font-black text-2xl text-foreground mb-1">
            Access <span className="text-destructive">Denied</span>
          </h1>
          <p className="text-foreground/50 text-sm mb-2">
            Your account doesn't have admin privileges yet.
          </p>
          <p className="text-xs text-foreground/35 mb-6 font-mono truncate">
            {identity?.getPrincipal().toString()}
          </p>

          <div className="space-y-3">
            <Button
              data-ocid="admin.request_access.primary_button"
              onClick={handleRequestAdmin}
              disabled={assignRole.isPending}
              className="btn-neon-cyan border-0 w-full font-bold gap-2"
            >
              {assignRole.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Requesting…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Request Admin Access
                </>
              )}
            </Button>

            <Button
              variant="outline"
              data-ocid="admin.access_denied.logout.button"
              onClick={clear}
              className="w-full border-border/50 hover:border-destructive/50 hover:text-destructive gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Logged in AND admin
  return <AdminDashboard onLogout={clear} />;
}
