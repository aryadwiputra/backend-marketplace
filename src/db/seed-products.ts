import { db, stores, productCategories, products } from './index'

async function seedProducts() {
  console.log('📦 Seeding products...')

  const allStores = await db.select().from(stores)
  const allCategories = await db.select().from(productCategories)

  const techStore = allStores.find(s => s.username === 'techzone')
  const fashionStore = allStores.find(s => s.username === 'fashion_forward')
  const techCategory = allCategories.find(c => c.slug === 'electronics')
  const fashionCategory = allCategories.find(c => c.slug === 'fashion')

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
}

seedProducts()
  .catch(console.error)
  .finally(() => process.exit())
