"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  ShoppingBag,
  Gem,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Tag,
  Package,
  Layers,
  Image as ImageIcon
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export interface ShopProduct {
  id: string
  name: string
  description: string
  category: string
  base_price: number
  duration_minutes: number // used as MRP original price
  image_url: string | null
  samagri_included: boolean // used as Lab Certified / Energised
  is_active: boolean
  created_at: string
}

const CATEGORIES = [
  "All",
  "Bracelets",
  "Crystals",
  "Rudraksha",
  "Zodiac",
  "Yantras",
  "Gemstones"
]

const SAMPLE_IMAGES = [
  { name: "Green Aventurine / Jade", url: "https://images.unsplash.com/photo-1611591475152-473523dd66c8?w=600&auto=format&fit=crop&q=80" },
  { name: "Pyrite / Gold Beads", url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80" },
  { name: "Rudraksha Beads", url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&auto=format&fit=crop&q=80" },
  { name: "Yellow Citrine Quartz", url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80" },
  { name: "Amethyst Cluster", url: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=600&auto=format&fit=crop&q=80" },
  { name: "Sacred Gold Yantra", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" }
]

export default function ShopManagementPage() {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Add / Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ShopProduct | null>(null)

  // Form State
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formCategory, setFormCategory] = useState("Bracelets")
  const [formPrice, setFormPrice] = useState("")
  const [formMrp, setFormMrp] = useState("")
  const [formImageUrl, setFormImageUrl] = useState("")
  const [formCertified, setFormCertified] = useState(true)
  const [formActive, setFormActive] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function fetchProducts() {
    setIsLoading(true)
    try {
      const res = await api.get('/pooja/services')
      const items = (res.data || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description || '',
        category: 'Spiritual',
        base_price: Number(s.price) || 0,
        duration_minutes: Number(s.price) * 1.5,
        image_url: s.image_url,
        samagri_included: s.samagri_included ?? true,
        is_active: s.is_active ?? true,
        created_at: s.created_at || new Date().toISOString(),
      }))
      setProducts(items)
    } catch (err) {
      console.error(err)
      toast.error("Network error while fetching products")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  function openAddModal() {
    setIsEditing(false)
    setEditingId(null)
    setFormName("")
    setFormDescription("")
    setFormCategory("Bracelets")
    setFormPrice("")
    setFormMrp("")
    setFormImageUrl(SAMPLE_IMAGES[0].url)
    setFormCertified(true)
    setFormActive(true)
    setIsDialogOpen(true)
  }

  function openEditModal(product: ShopProduct) {
    setIsEditing(true)
    setEditingId(product.id)
    setFormName(product.name)
    setFormDescription(product.description || "")
    const catClean = product.category.replace("Shop:", "")
    setFormCategory(catClean || "Bracelets")
    setFormPrice(product.base_price.toString())
    setFormMrp(product.duration_minutes ? product.duration_minutes.toString() : "")
    setFormImageUrl(product.image_url || "")
    setFormCertified(product.samagri_included)
    setFormActive(product.is_active)
    setIsDialogOpen(true)
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim() || !formPrice) {
      toast.error("Please enter a product name and price")
      return
    }

    const priceNum = parseFloat(formPrice)
    const mrpNum = formMrp ? parseFloat(formMrp) : priceNum * 1.5

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim(),
        category: `Shop:${formCategory}`,
        base_price: priceNum,
        duration_minutes: Math.round(mrpNum),
        image_url: formImageUrl.trim() || null,
        samagri_included: formCertified,
        is_active: formActive
      }

      if (isEditing && editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...payload, base_price: priceNum } : p))
        toast.success(`Updated "${formName}" successfully!`)
      } else {
        const newProd = {
          id: `prod_${Date.now()}`,
          ...payload,
          base_price: priceNum,
          created_at: new Date().toISOString()
        }
        setProducts(prev => [newProd, ...prev])
        toast.success(`Added "${formName}" to Shop!`)
      }

      setIsDialogOpen(false)
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to save product: " + (err.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteProduct() {
    if (!productToDelete) return
    setIsSubmitting(true)
    try {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id))
      toast.success(`Deleted "${productToDelete.name}"`)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to delete product: " + (err.message || "Unknown error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function toggleProductStatus(product: ShopProduct) {
    try {
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      )
      toast.success(
        `"${product.name}" is now ${!product.is_active ? "Active" : "Inactive"}`
      )
    } catch (err: any) {
      console.error(err)
      toast.error("Failed to update status")
    }
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())

    const cleanCat = p.category.replace("Shop:", "")
    const matchesCategory =
      selectedCategory === "All" || cleanCat.toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="h-8 w-8 text-amber-500" />
            Shop & Astromall Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Add, update, and manage spiritual items, crystals, energized bracelets, and yantras.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={isLoading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={openAddModal}
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-100 bg-amber-50/50">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Total Products
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-900">
              {products.length} Items
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-emerald-100 bg-emerald-50/50">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Active in Store
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-900">
              {products.filter(p => p.is_active).length} Active
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-purple-100 bg-purple-50/50">
          <CardHeader className="py-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-purple-700">
              Lab Certified
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-purple-900">
              {products.filter(p => p.samagri_included).length} Verified
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {CATEGORIES.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "bg-amber-500 text-black hover:bg-amber-600 font-medium"
                  : "hover:bg-muted"
              }
            >
              {cat}
            </Button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>MRP / Discount</TableHead>
              <TableHead>Authenticity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-amber-500" />
                    <span>Loading Astromall products...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <span className="font-medium text-foreground">No products found</span>
                    <span className="text-sm">Click "Add New Product" to list an item in the Shop.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map(product => {
                const categoryClean = product.category.replace("Shop:", "")
                const mrp = product.duration_minutes || product.base_price
                const discount = mrp > product.base_price
                  ? Math.round(((mrp - product.base_price) / mrp) * 100)
                  : 0

                return (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      {product.image_url ? (
                        <div className="h-12 w-12 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                          🛍️
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">{product.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                        {product.description || "100% natural, energized by Vedic Pandits."}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
                        {categoryClean}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-foreground">₹{product.base_price}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="line-through text-muted-foreground">₹{mrp}</span>
                        {discount > 0 && (
                          <span className="text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
                            {discount}% OFF
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {product.samagri_included ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
                          Lab Certified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                          Standard
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          product.is_active
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {product.is_active ? "Active" : "Inactive"}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(product)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setProductToDelete(product)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-500" />
              {isEditing ? "Edit Shop Product" : "Add New Item to Shop"}
            </DialogTitle>
            <DialogDescription>
              Enter the product specifications, pricing, and high-resolution image URL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4 py-2">
            <div>
              <label className="text-sm font-semibold mb-1 block">Product Name *</label>
              <Input
                placeholder="e.g. Natural Pyrite Wealth Bracelet"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">Category *</label>
                <select
                  value={formCategory}
                  onChange={e => setFormCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Bracelets">Bracelets</option>
                  <option value="Crystals">Crystals</option>
                  <option value="Rudraksha">Rudraksha</option>
                  <option value="Zodiac">Zodiac</option>
                  <option value="Yantras">Yantras</option>
                  <option value="Gemstones">Gemstones</option>
                  <option value="Pooja Samagri">Pooja Samagri</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold mb-1 block">Selling Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="899"
                  value={formPrice}
                  onChange={e => setFormPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-semibold mb-1 block">MRP Original Price (₹)</label>
                <Input
                  type="number"
                  placeholder="1400"
                  value={formMrp}
                  onChange={e => setFormMrp(e.target.value)}
                />
              </div>

              <div className="flex flex-col justify-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={formCertified}
                    onChange={e => setFormCertified(e.target.checked)}
                    className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>100% Lab Certified</span>
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea
                rows={3}
                placeholder="Product details, spiritual benefits, crystal properties..."
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                className="w-full p-2.5 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Image URL</label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={formImageUrl}
                onChange={e => setFormImageUrl(e.target.value)}
              />
              <div className="mt-2">
                <span className="text-xs text-muted-foreground mb-1 block">
                  Quick Select Sample Product Images:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_IMAGES.map((img, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setFormImageUrl(img.url)}
                      className="text-xs bg-muted hover:bg-amber-100 px-2 py-1 rounded border transition-colors text-muted-foreground hover:text-amber-900"
                    >
                      {img.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <span>List Product as Active in Customer App</span>
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Update Product"
                  : "Publish to Shop"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                "{productToDelete?.name}"
              </span>{" "}
              from the shop? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProduct}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
