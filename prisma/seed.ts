import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding AgriConnect database...");

  // Clean existing data
  await prisma.tradeOffer.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationUser.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.cropScan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.priceAlert.deleteMany();
  await prisma.marketPrice.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create demo users
  const farmer1 = await prisma.user.create({
    data: {
      id: "farmer-1",
      email: "ramesh@agriconnect.in",
      phone: "+919825411209",
      passwordHash: password,
      name: "Ramesh Patel",
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Patel Bio-Organic Agro Farm (18 Acres)",
      location: "Bardoli, Surat, Gujarat",
      verificationLevel: "gold_certified",
      verifiedKyc: true,
      verifiedLand: true,
      verifiedSoil: true,
      verifiedOrganic: true,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      id: "farmer-2",
      email: "gurpreet@agriconnect.in",
      phone: "+919814088231",
      passwordHash: password,
      name: "Gurpreet Singh",
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Singh Wheat & Mustard Farm",
      location: "Khanna, Ludhiana, Punjab",
      verificationLevel: "gold_certified",
      verifiedKyc: true,
      verifiedLand: true,
      verifiedSoil: true,
    },
  });

  const farmer3 = await prisma.user.create({
    data: {
      id: "farmer-3",
      email: "sunita@agriconnect.in",
      phone: "+919431244901",
      passwordHash: password,
      name: "Sunita Devi",
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Devi Organic Pulses Farm",
      location: "Samastipur, Bihar",
      verificationLevel: "land_verified",
      verifiedKyc: true,
      verifiedLand: true,
      verifiedSoil: true,
    },
  });

  const farmer4 = await prisma.user.create({
    data: {
      id: "farmer-4",
      email: "venkatesh@agriconnect.in",
      phone: "+919701155620",
      passwordHash: password,
      name: "Venkatesh Rao",
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Rao Spice Exports",
      location: "Guntur Rural, Andhra Pradesh",
      verificationLevel: "gold_certified",
      verifiedKyc: true,
      verifiedLand: true,
      verifiedSoil: true,
      verifiedOrganic: true,
    },
  });

  const farmer5 = await prisma.user.create({
    data: {
      id: "farmer-5",
      email: "babanrao@agriconnect.in",
      phone: "+919822077149",
      passwordHash: password,
      name: "Babanrao Patil",
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Patil Onion & Tomato Farm",
      location: "Lasalgaon, Nashik, Maharashtra",
      verificationLevel: "land_verified",
      verifiedKyc: true,
      verifiedLand: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      id: "buyer-user",
      email: "rajesh@apexfoods.in",
      phone: "+919811044219",
      passwordHash: password,
      name: "Rajesh Singhania",
      role: "buyer",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      organizationOrFarm: "Apex Food Processing & Exports Corp",
      location: "New Delhi / Mundra Port Hub",
      verificationLevel: "gold_certified",
    },
  });

  console.log("✅ Created 6 users");

  // Create listings with images
  const listings = [
    {
      id: "crop-1", farmerId: "farmer-1", title: "Certified Organic 1121 Traditional Basmati Paddy/Rice",
      cropName: "Basmati Rice", variety: "1121 Extra Long Grain", category: "Grains",
      quantity: 180, unit: "quintals", pricePerUnit: 3850, mandiBenchmarkPrice: 3450,
      minOrderQuantity: 15, harvestDate: "2026-08-10", location: "Bardoli, Surat", state: "Gujarat",
      grade: "Grade A+", isOrganic: true, organicCertNumber: "NPOP/NAB/0019/2026",
      storageType: "Dry Ventilated Shed", moistureContent: 11.2,
      description: "Aged 1121 Basmati with average grain length of 8.35mm. Tested 100% pesticide residue free under NPOP guidelines.",
      tags: JSON.stringify(["Aged Grain", "NPOP Certified", "Export Quality", "Direct Farm Gate"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
        { imageUrl: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=800&auto=format&fit=crop&q=80", sortOrder: 1 },
      ]},
    },
    {
      id: "crop-2", farmerId: "farmer-2", title: "Premium Sharbati Golden Wheat (High Protein 13.8%)",
      cropName: "Wheat", variety: "C-306 Sharbati Desi", category: "Grains",
      quantity: 350, unit: "quintals", pricePerUnit: 2680, mandiBenchmarkPrice: 2420,
      minOrderQuantity: 25, harvestDate: "2026-08-04", location: "Khanna, Ludhiana", state: "Punjab",
      grade: "Grade A+", isOrganic: false, storageType: "Warehouse", moistureContent: 10.8,
      description: "Lustrous, heavy bold grain Sharbati wheat. Ideal for premium whole wheat atta mills. High gluten strength.",
      tags: JSON.stringify(["High Protein", "Mechanically Cleaned", "Bulk Discount", "FSSAI Grade"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-3", farmerId: "farmer-5", title: "Fresh Red Hybrid Tomatoes (Firm, Thick Skin for Transit)",
      cropName: "Tomato", variety: "Abhinav Hybrid F1", category: "Vegetables",
      quantity: 120, unit: "quintals", pricePerUnit: 1650, mandiBenchmarkPrice: 1450,
      minOrderQuantity: 10, harvestDate: "2026-08-16", location: "Lasalgaon, Nashik", state: "Maharashtra",
      grade: "Grade A", isOrganic: false, storageType: "Farm Packhouse", moistureContent: 88,
      description: "Freshly harvested firm red tomatoes packed in 25 kg crates. 70-80mm caliber, thick wall ensuring 8+ days transit shelf life.",
      tags: JSON.stringify(["Fresh Daily Harvest", "Long Shelf Life", "Crate Packed", "Bulk Produce"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-4", farmerId: "farmer-4", title: "High Curcumin (5.2%) Salem Haldi / Organic Turmeric Whole",
      cropName: "Turmeric", variety: "Salem Golden Finger", category: "Spices",
      quantity: 65, unit: "quintals", pricePerUnit: 13200, mandiBenchmarkPrice: 11800,
      minOrderQuantity: 5, harvestDate: "2026-07-28", location: "Guntur Rural", state: "Andhra Pradesh",
      grade: "Grade A+", isOrganic: true, organicCertNumber: "APEDA-ORG-778912",
      storageType: "Dry Ventilated Shed", moistureContent: 9.5,
      description: "Laboratory verified 5.2% natural Curcumin content. Steam boiled, solar tunnel dried. Zero lead chromate.",
      tags: JSON.stringify(["High Curcumin", "Solar Dried", "Lab Certified", "Nutraceutical Grade"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-5", farmerId: "farmer-3", title: "Unpolished Desi Organic Arhar / Tur Dal (Pigeon Pea)",
      cropName: "Arhar Dal", variety: "Desi Red Pigeon Pea", category: "Pulses",
      quantity: 90, unit: "quintals", pricePerUnit: 9800, mandiBenchmarkPrice: 8900,
      minOrderQuantity: 5, harvestDate: "2026-08-01", location: "Samastipur", state: "Bihar",
      grade: "Grade A+", isOrganic: true, organicCertNumber: "PGS-IND-BI-992",
      storageType: "Dry Ventilated Shed", moistureContent: 10.5,
      description: "Traditional water-milled, unpolished Desi Arhar dal. Preserves 100% natural fiber and protein content.",
      tags: JSON.stringify(["Unpolished", "High Fiber", "Desi Variety", "Women-Led Farm"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1585994192700-112e48227b9c?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-6", farmerId: "farmer-5", title: "Nashik Garva Red Onion (Long Keeping Quality, 45-55mm)",
      cropName: "Red Onion", variety: "Nashik Garva Kharif", category: "Vegetables",
      quantity: 400, unit: "quintals", pricePerUnit: 2250, mandiBenchmarkPrice: 1980,
      minOrderQuantity: 30, harvestDate: "2026-08-08", location: "Lasalgaon, Nashik", state: "Maharashtra",
      grade: "Grade A", isOrganic: false, storageType: "Warehouse", moistureContent: 12,
      description: "Dry cured in aerated chawls with 3 paper skins. Low sprouting risk, uniform 45-55mm diameter.",
      tags: JSON.stringify(["Nashik Origin", "Cured Skin", "Low Spoilage", "Export Standard"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-7", farmerId: "farmer-4", title: "Guntur Teja Stemless Red Dry Chili (SHU 75,000+ Extra Hot)",
      cropName: "Red Chili", variety: "Teja S17 Stemless", category: "Spices",
      quantity: 80, unit: "quintals", pricePerUnit: 19500, mandiBenchmarkPrice: 17800,
      minOrderQuantity: 5, harvestDate: "2026-07-20", location: "Guntur Rural", state: "Andhra Pradesh",
      grade: "Grade A+", isOrganic: false, storageType: "Cold Storage", moistureContent: 9,
      description: "Deep red color, hand-destemmed, extra spicy Teja chili. 75,000-85,000 SHU. Free from fungal mold.",
      tags: JSON.stringify(["Extra Hot", "Hand Destemmed", "Cold Storage", "Oleoresin Rich"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
    {
      id: "crop-8", farmerId: "farmer-2", title: "High Oil Yellow Soybean (Seed Quality & Crushing Grade)",
      cropName: "Soybean", variety: "JS-335 Yellow", category: "Oilseeds",
      quantity: 220, unit: "quintals", pricePerUnit: 4950, mandiBenchmarkPrice: 4600,
      minOrderQuantity: 20, harvestDate: "2026-08-05", location: "Khanna, Ludhiana", state: "Punjab",
      grade: "Grade A", isOrganic: false, storageType: "Warehouse", moistureContent: 10.2,
      description: "High oil recovery (18.5-19.2%) and 39% crude protein. Machine cleaned, zero mud balls.",
      tags: JSON.stringify(["High Oil Recovery", "Mechanically Cleaned", "Protein Rich"]),
      images: { create: [
        { imageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&auto=format&fit=crop&q=80", sortOrder: 0 },
      ]},
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({ data: listing as any });
  }
  console.log("✅ Created 8 crop listings");

  // Create market prices
  const prices = [
    { crop: "Basmati Rice (1121)", market: "Karnal Mandi", mandiPrice: 3450, directPrice: 3850, change: "+4.2%", trend: "up", unit: "₹/qtl" },
    { crop: "Sharbati Wheat", market: "Khanna APMC", mandiPrice: 2420, directPrice: 2680, change: "+1.8%", trend: "up", unit: "₹/qtl" },
    { crop: "Red Hybrid Tomato", market: "Nashik Mandi", mandiPrice: 1450, directPrice: 1650, change: "-3.1%", trend: "down", unit: "₹/qtl" },
    { crop: "Salem Turmeric", market: "Erode Yard", mandiPrice: 11800, directPrice: 13200, change: "+8.5%", trend: "up", unit: "₹/qtl" },
    { crop: "Garva Red Onion", market: "Lasalgaon Mandi", mandiPrice: 1980, directPrice: 2250, change: "+5.4%", trend: "up", unit: "₹/qtl" },
    { crop: "Teja Red Chili", market: "Guntur APMC", mandiPrice: 17800, directPrice: 19500, change: "+2.1%", trend: "up", unit: "₹/qtl" },
    { crop: "Yellow Soybean", market: "Indore Mandi", mandiPrice: 4600, directPrice: 4950, change: "+0.5%", trend: "stable", unit: "₹/qtl" },
  ];

  for (const price of prices) {
    await prisma.marketPrice.create({ data: price });
  }
  console.log("✅ Created market prices");

  console.log("🎉 Seeding complete!");
  console.log("\n📋 Demo accounts (password: password123):");
  console.log("   Farmer: ramesh@agriconnect.in");
  console.log("   Farmer: gurpreet@agriconnect.in");
  console.log("   Farmer: sunita@agriconnect.in");
  console.log("   Farmer: venkatesh@agriconnect.in");
  console.log("   Farmer: babanrao@agriconnect.in");
  console.log("   Buyer:  rajesh@apexfoods.in");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
