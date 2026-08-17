import { db, users, stores, productCategories, products, addresses } from './index'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create Admin User
  await db.insert(users).values({
    name: 'Admin',
    email: 'admin@marketplace.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  })
  console.log('✅ Admin user created: admin@marketplace.com')

  // Create Buyer User
  await db.insert(users).values({
    name: 'John Doe',
    email: 'buyer@marketplace.com',
    password: await bcrypt.hash('buyer123', 10),
    role: 'buyer',
  })
  console.log('✅ Buyer user created: buyer@marketplace.com')

  // Create Seller Users
  await db.insert(users).values({
    name: 'Jane Smith',
    email: 'seller1@marketplace.com',
    password: await bcrypt.hash('seller123', 10),
    role: 'seller',
  })

  await db.insert(users).values({
    name: 'Bob Wilson',
    email: 'seller2@marketplace.com',
    password: await bcrypt.hash('seller123', 10),
    role: 'seller',
  })
  console.log('✅ Seller users created')

  // Create Categories
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '📱' },
    { name: 'Fashion', slug: 'fashion', icon: '👕' },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
    { name: 'Books', slug: 'books', icon: '📚' },
  ]

  for (const cat of categories) {
    await db.insert(productCategories).values(cat)
  }
  console.log('✅ Categories created:', categories.length)

  // Get users
  const allUsers = await db.select().from(users)
  const seller1 = allUsers.find(u => u.email === 'seller1@marketplace.com')
  const seller2 = allUsers.find(u => u.email === 'seller2@marketplace.com')
  const buyer = allUsers.find(u => u.email === 'buyer@marketplace.com')

  // Create Stores
  await db.insert(stores).values({
    user_id: seller1.id,
    name: 'TechZone Store',
    username: 'techzone',
    description: 'Your one-stop shop for all things tech',
    logo: 'https://via.placeholder.com/200x200?text=TechZone',
    balance: '1000000',
    is_verified: true,
  })

  await db.insert(stores).values({
    user_id: seller2.id,
    name: 'Fashion Forward',
    username: 'fashion_forward',
    description: 'Trendy fashion for everyone',
    logo: 'https://via.placeholder.com/200x200?text=Fashion',
    balance: '500000',
    is_verified: true,
  })
  console.log('✅ Stores created')

  // Get stores
  const allStores = await db.select().from(stores)
  const techStore = allStores.find(s => s.username === 'techzone')
  const fashionStore = allStores.find(s => s.username === 'fashion_forward')

  // Get categories
  const allCategories = await db.select().from(productCategories)
  const techCategory = allCategories.find(c => c.slug === 'electronics')
  const fashionCategory = allCategories.find(c => c.slug === 'fashion')

  // Create Products
  const techProducts = [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: '24999000', stock: 50, weight: 200, images: ['https://via.placeholder.com/400x400?text=iPhone'] },
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', price: '18999000', stock: 30, weight: 500, images: ['https://via.placeholder.com/400x400?text=MacBook'] },
    { name: 'AirPods Pro', slug: 'airpods-pro', price: '4299000', stock: 100, weight: 50, images: ['https://via.placeholder.com/400x400?text=AirPods'] },
    { name: 'iPad Air', slug: 'ipad-air', price: '12999000', stock: 40, weight: 300, images: ['https://via.placeholder.com/400x400?text=iPad'] },
    { name: 'Apple Watch', slug: 'apple-watch', price: '7999000', stock: 60, weight: 100, images: ['https://via.placeholder.com/400x400?text=Watch'] },
  ]

  const fashionProducts = [
    { name: 'Casual T-Shirt', slug: 'casual-tshirt', price: '199000', stock: 200, weight: 150, images: ['https://via.placeholder.com/400x400?text=TShirt'] },
    { name: 'Denim Jeans', slug: 'denim-jeans', price: '399000', stock: 150, weight: 400, images: ['https://via.placeholder.com/400x400?text=Jeans'] },
    { name: 'Running Shoes', slug: 'running-shoes', price: '599000', stock: 100, weight: 300, images: ['https://via.placeholder.com/400x400?text=Shoes'] },
    { name: 'Leather Bag', slug: 'leather-bag', price: '899000', stock: 50, weight: 200, images: ['https://via.placeholder.com/400x400?text=Bag'] },
  ]

  for (const product of techProducts) {
    await db.insert(products).values({
      store_id: techStore.id,
      category_id: techCategory.id,
      description: `High quality ${product.name} from official distributor`,
      ...product,
    })
  }

  for (const product of fashionProducts) {
    await db.insert(products).values({
      store_id: fashionStore.id,
      category_id: fashionCategory.id,
      description: `Premium quality ${product.name} for your style`,
      ...product,
    })
  }
  console.log('✅ Products created:', techProducts.length + fashionProducts.length)

  // Create Address for Buyer
  await db.insert(addresses).values({
    user_id: buyer.id,
    label: 'Home',
    city: '3171',
    city_name: 'Kota Jakarta Selatan',
    zip_code: '12345',
  })
  console.log('✅ Buyer address created')

  console.log('\n🎉 Seeding completed!')
  console.log('\n📧 Test Credentials:')
  console.log('   Admin: admin@marketplace.com / admin123')
  console.log('   Buyer: buyer@marketplace.com / buyer123')
  console.log('   Seller 1: seller1@marketplace.com / seller123')
  console.log('   Seller 2: seller2@marketplace.com / seller123')
}

seed()
  .catch(console.error)
  .finally(() => process.exit())
