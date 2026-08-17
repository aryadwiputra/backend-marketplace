import { db, stores, productCategories, products } from './index'

async function seedProducts() {
  console.log('📦 Seeding products with local images...')

  const allStores = await db.select().from(stores)
  const allCategories = await db.select().from(productCategories)

  const techStore = allStores.find(s => s.username === 'techzone')
  const fashionStore = allStores.find(s => s.username === 'fashion_forward')

  const techCategory = allCategories.find(c => c.slug === 'electronics')
  const fashionCategory = allCategories.find(c => c.slug === 'fashion')

  // Delete existing products
  await db.delete(products)

  const techProducts = [
    { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', price: '24999000', stock: 50, weight: 200, images: ['/images/thumbnails/iphone.png'] },
    { name: 'iPhone 15', slug: 'iphone-15', price: '19999000', stock: 40, weight: 200, images: ['/images/thumbnails/iphone-2.png'] },
    { name: 'MacBook Pro M3', slug: 'macbook-pro-m3', price: '24999000', stock: 30, weight: 500, images: ['/images/thumbnails/macbook-pro-m2.png'] },
    { name: 'MacBook Air M3', slug: 'macbook-air-m3', price: '18999000', stock: 35, weight: 500, images: ['/images/thumbnails/macbook.png'] },
    { name: 'AirPods Pro', slug: 'airpods-pro', price: '4299000', stock: 100, weight: 50, images: ['/images/thumbnails/airpod.png'] },
    { name: 'AirPods Max', slug: 'airpods-max', price: '9999000', stock: 60, weight: 150, images: ['/images/thumbnails/headphone-gold.png'] },
    { name: 'iPad Pro', slug: 'ipad-pro', price: '15999000', stock: 45, weight: 300, images: ['/images/thumbnails/ip-blue.png'] },
    { name: 'Apple Watch', slug: 'apple-watch', price: '7999000', stock: 70, weight: 100, images: ['/images/thumbnails/apple.png'] },
    { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', price: '17999000', stock: 55, weight: 200, images: ['/images/thumbnails/samsung.png'] },
    { name: 'Xiaomi 14', slug: 'xiaomi-14', price: '9999000', stock: 65, weight: 200, images: ['/images/thumbnails/xiaomi.png'] },
  ]

  const fashionProducts = [
    { name: 'Pro Backpack', slug: 'pro-backpack', price: '599000', stock: 200, weight: 500, images: ['/images/thumbnails/backpack-1.png'] },
    { name: 'School Bag Premium', slug: 'school-bag-premium', price: '399000', stock: 150, weight: 400, images: ['/images/thumbnails/backpack-2.png'] },
    { name: 'Travel Bag Large', slug: 'travel-bag-large', price: '899000', stock: 100, weight: 600, images: ['/images/thumbnails/backpack-3.png'] },
    { name: 'Laptop Messenger Bag', slug: 'laptop-messenger-bag', price: '799000', stock: 120, weight: 450, images: ['/images/thumbnails/backpack-4.png'] },
  ]

  for (const product of techProducts) {
    await db.insert(products).values({
      store_id: techStore.id,
      category_id: techCategory.id,
      description: `High quality ${product.name} from official distributor. Best price guaranteed!`,
      ...product,
    })
  }

  for (const product of fashionProducts) {
    await db.insert(products).values({
      store_id: fashionStore.id,
      category_id: fashionCategory.id,
      description: `Premium quality ${product.name} for your lifestyle. Durable and stylish!`,
      ...product,
    })
  }

  console.log('✅ Products created:', techProducts.length + fashionProducts.length)
  console.log('📁 Images: Local paths (/images/thumbnails/*)')
}

seedProducts()
  .catch(console.error)
  .finally(() => process.exit())
