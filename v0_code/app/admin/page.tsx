"use client"

import { useState } from "react"
import { ScrollHeader } from "@/components/scroll-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, ShoppingCart, Users, TrendingUp, Plus, Edit, Trash2, Eye } from "lucide-react"

const dashboardStats = [
  {
    title: "Total Orders",
    value: "1,234",
    change: "+12%",
    icon: ShoppingCart,
    color: "text-blue-600",
  },
  {
    title: "Products",
    value: "157",
    change: "+3",
    icon: Package,
    color: "text-green-600",
  },
  {
    title: "Customers",
    value: "892",
    change: "+8%",
    icon: Users,
    color: "text-purple-600",
  },
  {
    title: "Revenue",
    value: "₩12,450,000",
    change: "+15%",
    icon: TrendingUp,
    color: "text-orange-600",
  },
]

const recentOrders = [
  {
    id: "ORD-001",
    customer: "김철수",
    product: "AGV 캐스터 200mm",
    amount: "₩85,000",
    status: "배송중",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "박영희",
    product: "폴리우레탄 휠 150mm",
    amount: "₩45,000",
    status: "완료",
    date: "2024-01-14",
  },
  {
    id: "ORD-003",
    customer: "이민수",
    product: "메카넘 휠 세트",
    amount: "₩320,000",
    status: "준비중",
    date: "2024-01-14",
  },
]

const products = [
  {
    id: 1,
    name: "AGV 중하중용 캐스터 200mm",
    category: "AGV 캐스터",
    price: "₩85,000",
    stock: 15,
    status: "판매중",
  },
  {
    id: 2,
    name: "산업용 폴리우레탄 휠 150mm",
    category: "폴리우레탄 휠",
    price: "₩45,000",
    stock: 23,
    status: "판매중",
  },
  {
    id: 3,
    name: "메카넘 휠 세트 (4개입)",
    category: "메카넘 휠",
    price: "₩320,000",
    stock: 8,
    status: "판매중",
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "완료":
        return "bg-green-100 text-green-800"
      case "배송중":
        return "bg-blue-100 text-blue-800"
      case "준비중":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <ScrollHeader />

      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">JPCaster Store Management</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardStats.map((stat, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-sm text-green-600">{stat.change}</p>
                        </div>
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>{order.amount}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Product Management</h2>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Button>
              </div>

              {/* Add New Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Product</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productName">Product Name</Label>
                      <Input
                        id="productName"
                        placeholder="Enter product name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newProduct.category}
                        onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agv-caster">AGV Caster</SelectItem>
                          <SelectItem value="equipment-caster">Equipment Caster</SelectItem>
                          <SelectItem value="polyurethane-wheel">Polyurethane Wheel</SelectItem>
                          <SelectItem value="rubber-wheel">Rubber Wheel</SelectItem>
                          <SelectItem value="drive-module">Drive Module</SelectItem>
                          <SelectItem value="mecanum-wheel">Mecanum Wheel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        placeholder="Enter price"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        placeholder="Stock quantity"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter product description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>
                  <Button>Add Product</Button>
                </CardContent>
              </Card>

              {/* Products List */}
              <Card>
                <CardHeader>
                  <CardTitle>Product List</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.price}</TableCell>
                          <TableCell>{product.stock}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-100 text-green-800">{product.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 bg-transparent">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <h2 className="text-2xl font-bold">Order Management</h2>

              <Card>
                <CardHeader>
                  <CardTitle>All Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell>{order.product}</TableCell>
                          <TableCell>1</TableCell>
                          <TableCell>{order.amount}</TableCell>
                          <TableCell>
                            <Select defaultValue={order.status}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="준비중">준비중</SelectItem>
                                <SelectItem value="배송중">배송중</SelectItem>
                                <SelectItem value="완료">완료</SelectItem>
                                <SelectItem value="취소">취소</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Customers Tab */}
            <TabsContent value="customers" className="space-y-6">
              <h2 className="text-2xl font-bold">Customer Management</h2>

              <Card>
                <CardHeader>
                  <CardTitle>Customer List</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Total Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">김철수</TableCell>
                        <TableCell>kim@example.com</TableCell>
                        <TableCell>010-1234-5678</TableCell>
                        <TableCell>3</TableCell>
                        <TableCell>₩450,000</TableCell>
                        <TableCell>2023-12-15</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">박영희</TableCell>
                        <TableCell>park@example.com</TableCell>
                        <TableCell>010-9876-5432</TableCell>
                        <TableCell>1</TableCell>
                        <TableCell>₩45,000</TableCell>
                        <TableCell>2024-01-10</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">이민수</TableCell>
                        <TableCell>lee@example.com</TableCell>
                        <TableCell>010-5555-1234</TableCell>
                        <TableCell>2</TableCell>
                        <TableCell>₩650,000</TableCell>
                        <TableCell>2023-11-20</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
