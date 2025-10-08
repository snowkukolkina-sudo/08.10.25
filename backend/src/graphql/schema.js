const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    status: UserStatus!
    phone: String
    avatarUrl: String
    permissions: JSON
    lastLogin: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum UserRole {
    ADMIN
    MANAGER
    CASHIER
    SENIOR_CASHIER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    imageUrl: String
    sortOrder: Int!
    isActive: Boolean!
    parentId: ID
    parent: Category
    children: [Category!]!
    products: [Product!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    sku: String!
    description: String
    categoryId: ID!
    category: Category!
    price: Float!
    cost: Float
    imageUrl: String
    images: [String!]!
    modifiers: [JSON!]!
    allergens: [String!]!
    nutrition: JSON
    isAvailable: Boolean!
    isMarked: Boolean!
    markingCode: String
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrderItem {
    id: ID!
    orderId: ID!
    productId: ID!
    product: Product!
    productName: String!
    productSku: String!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    modifiers: [JSON!]!
    notes: String
    createdAt: DateTime!
  }

  type Order {
    id: ID!
    orderNumber: String!
    type: OrderType!
    status: OrderStatus!
    paymentStatus: PaymentStatus!
    subtotal: Float!
    taxAmount: Float!
    discountAmount: Float!
    deliveryFee: Float!
    totalAmount: Float!
    customerName: String
    customerPhone: String
    customerEmail: String
    deliveryAddress: JSON
    paymentMethod: String
    notes: String
    cashierId: ID
    cashier: User
    courierId: ID
    courier: User
    estimatedDelivery: DateTime
    deliveredAt: DateTime
    items: [OrderItem!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum OrderType {
    DINE_IN
    TAKEAWAY
    DELIVERY
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    READY
    DELIVERED
    CANCELLED
  }

  enum PaymentStatus {
    PENDING
    PAID
    REFUNDED
    FAILED
  }

  type Payment {
    id: ID!
    orderId: ID!
    order: Order!
    type: PaymentType!
    status: PaymentStatus!
    amount: Float!
    transactionId: String
    terminalId: String
    paymentData: JSON
    notes: String
    processedBy: ID
    processedByUser: User
    processedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum PaymentType {
    CASH
    CARD
    ONLINE
    MIXED
  }

  type FiscalReceipt {
    id: ID!
    orderId: ID!
    order: Order!
    receiptNumber: String!
    type: FiscalReceiptType!
    status: FiscalReceiptStatus!
    fnSerial: String!
    fdNumber: String
    fpNumber: String
    qrCode: String
    receiptData: JSON!
    ofdResponse: JSON
    errorMessage: String
    sentAt: DateTime
    confirmedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum FiscalReceiptType {
    SALE
    RETURN
    REFUND
  }

  enum FiscalReceiptStatus {
    PENDING
    SENT
    CONFIRMED
    FAILED
  }

  type DeliveryZone {
    id: ID!
    name: String!
    description: String
    polygonCoordinates: JSON!
    deliveryFee: Float!
    minOrderAmount: Float!
    estimatedDeliveryTime: Int!
    isActive: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type CategoryConnection {
    data: [Category!]!
    pagination: PaginationInfo!
  }

  type ProductConnection {
    data: [Product!]!
    pagination: PaginationInfo!
  }

  type OrderConnection {
    data: [Order!]!
    pagination: PaginationInfo!
  }

  type PaymentConnection {
    data: [Payment!]!
    pagination: PaginationInfo!
  }

  type FiscalReceiptConnection {
    data: [FiscalReceipt!]!
    pagination: PaginationInfo!
  }

  input CreateCategoryInput {
    name: String!
    slug: String!
    description: String
    imageUrl: String
    sortOrder: Int
    parentId: ID
  }

  input UpdateCategoryInput {
    name: String
    slug: String
    description: String
    imageUrl: String
    sortOrder: Int
    parentId: ID
    isActive: Boolean
  }

  input CreateProductInput {
    name: String!
    sku: String!
    description: String
    categoryId: ID!
    price: Float!
    cost: Float
    imageUrl: String
    images: [String!]
    modifiers: [JSON!]
    allergens: [String!]
    nutrition: JSON
    isMarked: Boolean
    markingCode: String
    sortOrder: Int
  }

  input UpdateProductInput {
    name: String
    sku: String
    description: String
    categoryId: ID
    price: Float
    cost: Float
    imageUrl: String
    images: [String!]
    modifiers: [JSON!]
    allergens: [String!]
    nutrition: JSON
    isAvailable: Boolean
    isMarked: Boolean
    markingCode: String
    sortOrder: Int
  }

  input CreateOrderInput {
    type: OrderType!
    items: [OrderItemInput!]!
    customerName: String
    customerPhone: String
    customerEmail: String
    deliveryAddress: JSON
    notes: String
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
    modifiers: [JSON!]
    notes: String
  }

  input UpdateOrderStatusInput {
    status: OrderStatus!
    notes: String
  }

  input CreatePaymentInput {
    orderId: ID!
    type: PaymentType!
    amount: Float!
    transactionId: String
    terminalId: String
    paymentData: JSON
    notes: String
  }

  input ProductFilters {
    categoryId: ID
    isAvailable: Boolean
    search: String
  }

  input OrderFilters {
    status: OrderStatus
    type: OrderType
    dateFrom: DateTime
    dateTo: DateTime
  }

  type Query {
    # Users
    me: User
    users(page: Int = 1, limit: Int = 50): UserConnection!
    user(id: ID!): User

    # Categories
    categories: [Category!]!
    category(id: ID!): Category
    categoriesConnection(page: Int = 1, limit: Int = 50): CategoryConnection!

    # Products
    products(
      page: Int = 1
      limit: Int = 50
      filters: ProductFilters
    ): ProductConnection!
    product(id: ID!): Product

    # Orders
    orders(
      page: Int = 1
      limit: Int = 50
      filters: OrderFilters
    ): OrderConnection!
    order(id: ID!): Order

    # Payments
    payments(page: Int = 1, limit: Int = 50): PaymentConnection!
    payment(id: ID!): Payment

    # Fiscal Receipts
    fiscalReceipts(page: Int = 1, limit: Int = 50): FiscalReceiptConnection!
    fiscalReceipt(id: ID!): FiscalReceipt

    # Delivery Zones
    deliveryZones: [DeliveryZone!]!
    deliveryZone(id: ID!): DeliveryZone
  }

  type Mutation {
    # Categories
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Products
    createProduct(input: CreateProductInput!): Product!
    updateProduct(id: ID!, input: UpdateProductInput!): Product!
    deleteProduct(id: ID!): Boolean!

    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, input: UpdateOrderStatusInput!): Order!
    cancelOrder(id: ID!, reason: String): Order!
    assignCourier(orderId: ID!, courierId: ID!): Order!

    # Payments
    createPayment(input: CreatePaymentInput!): Payment!
    processPayment(id: ID!): Payment!
    refundPayment(id: ID!, amount: Float): Payment!

    # Fiscal
    sendFiscalReceipt(orderId: ID!): FiscalReceipt!
    retryFiscalReceipt(id: ID!): FiscalReceipt!
  }

  type Subscription {
    orderCreated: Order!
    orderUpdated: Order!
    orderCancelled: Order!
    paymentCompleted: Payment!
    paymentFailed: Payment!
    fiscalReceiptSent: FiscalReceipt!
    fiscalReceiptConfirmed: FiscalReceipt!
  }
`;

module.exports = typeDefs;
