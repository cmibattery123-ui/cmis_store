import sqlite3
import datetime
import uuid

def generate_cuid():
    return "cmr" + uuid.uuid4().hex[:20]

CATEGORIES = [
    {
        "id": "cmr922oiw0000oou110ljcmkz",
        "name": "Lithium Batteries",
        "slug": "lithium-batteries",
        "description": "High-performance non-maintenance lithium batteries",
        "sortOrder": 1,
    },
    {
        "id": "cmr922oj20002oou1ej57ewtn",
        "name": "Vehicle Batteries",
        "slug": "vehicle-batteries",
        "description": "Automotive batteries for two-wheelers and four-wheelers",
        "sortOrder": 2,
    },
    {
        "id": "cmr922ot00003oou1shd3fjcx",
        "name": "Inverter Batteries",
        "slug": "inverter-batteries",
        "description": "Long-life inverter batteries for home and office",
        "sortOrder": 3,
    },
    {
        "id": "cmr922oiy0001oou1w0m9so0k",
        "name": "UPS Batteries",
        "slug": "ups-batteries",
        "description": "Sealed maintenance-free batteries for UPS systems",
        "sortOrder": 4,
    },
    {
        "id": "cmr8ycr56000004kyihagzaix",
        "name": "Lithium Battery",
        "slug": "lithium-battery",
        "description": "Compact two-wheeler lithium starting batteries",
        "sortOrder": 5,
    },
]

PRODUCTS = [
    {
        "id": "cmr8ye69y000104kyxnqixyq8",
        "name": "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries",
        "sku": "CMIP 12 - 04",
        "slug": "12v-z4-4ah-4lb-perfect-lithium-batteries",
        "categorySlug": "lithium-battery",
        "shortDesc": "Versatile 4LB capacity battery balanced for performance with a 0.726 Kg weight and 11x7x9 cm size.",
        "description": "Versatile 4LB capacity battery balanced for performance with a 0.726 Kg weight and 11x7x9 cm size. Engineered with lithium technology for ultra-fast charging, lightweight build, and extended service life.",
        "price": 1200,
        "dealerPrice": 1000,
        "taxRate": 18,
        "warrantyMonths": 25,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 1,
        "inventory": 100,
        "images": [
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783664919/cmi-batteries/products/s8in176wrhlywpevq83x.jpg",
                "publicId": "cmi-batteries/products/s8in176wrhlywpevq83x",
                "altText": "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783664953/cmi-batteries/products/x4un5i2rcdb1rgodaliu.jpg",
                "publicId": "cmi-batteries/products/x4un5i2rcdb1rgodaliu",
                "altText": "12V -  Z4 / 4Ah / 4LB Perfect Lithium Batteries Side View",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "4", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Weight", "value": "0.726", "unit": "kg", "sortOrder": 3},
            {"label": "Dimensions", "value": "11×7×9", "unit": "cm", "sortOrder": 4},
            {"label": "Chemistry", "value": "LiFePO4", "unit": "", "sortOrder": 5},
            {"label": "Cycle Life", "value": "2000+", "unit": "cycles", "sortOrder": 6},
        ],
    },
    {
        "id": "cmrbmnbnc0000lwu1btc9szkh",
        "name": "12V -  Z5 / 5Ah / 5LB Perfect Lithium Batteries",
        "sku": "CMIP12-5",
        "slug": "12v-z5-5ah-5lb-perfect-lithium-batteries",
        "categorySlug": "vehicle-batteries",
        "shortDesc": "Sealed maintenance-free battery for motorcycles and scooters",
        "description": "High cranking power, vibration resistant, and completely maintenance-free. Compatible with all major two-wheeler brands.",
        "price": 1200,
        "dealerPrice": 900,
        "taxRate": 18,
        "warrantyMonths": 12,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 2,
        "inventory": 104,
        "images": [
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783664977/cmi-batteries/products/kxsipcbzis17wm11lqwi.jpg",
                "publicId": "cmi-batteries/products/kxsipcbzis17wm11lqwi",
                "altText": "12V -  Z5 / 5Ah / 5LB Perfect Lithium Batteries",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/batt1-removebg-preview.png",
                "publicId": "cmi_batt1_z5",
                "altText": "12V -  Z5 Lithium Battery Visual",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "5", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Type", "value": "VRLA Sealed", "unit": "", "sortOrder": 3},
            {"label": "Weight", "value": "0.92", "unit": "kg", "sortOrder": 4},
        ],
    },
    {
        "id": "cmr922qci0008oou1aeynp75i",
        "name": "Perfect LiFe 100Ah Lithium Iron Battery",
        "sku": "PB-LIFE-100",
        "slug": "perfect-life-100ah-lithium-iron-battery",
        "categorySlug": "lithium-batteries",
        "shortDesc": "100Ah LiFePO4 battery — ideal for solar and inverter setups",
        "description": "Industry-leading lithium iron phosphate battery offering superior cycle life, zero maintenance, and consistent power output. Perfect for residential solar systems, inverters, and telecom applications.",
        "price": 32500,
        "dealerPrice": 28000,
        "taxRate": 18,
        "warrantyMonths": 24,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 3,
        "inventory": 46,
        "images": [
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783665133/cmi-batteries/products/xuh4sy0lisyos7n8vwje.jpg",
                "publicId": "cmi-batteries/products/xuh4sy0lisyos7n8vwje",
                "altText": "Perfect LiFe 100Ah Lithium Iron Battery",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/hero_battery_visual_1778229195217.png",
                "publicId": "cmi_batt1_hero",
                "altText": "Perfect LiFe 100Ah Hero Visual",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "100", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Chemistry", "value": "LiFePO4", "unit": "", "sortOrder": 3},
            {"label": "Cycle Life", "value": "2000+", "unit": "cycles", "sortOrder": 4},
            {"label": "Weight", "value": "13", "unit": "kg", "sortOrder": 5},
            {"label": "Dimensions", "value": "326×175×220", "unit": "mm", "sortOrder": 6},
        ],
    },
    {
        "id": "cmr922qxz000noou1y5a6bpp0",
        "name": "Perfect Power 150Ah Inverter Battery",
        "sku": "PB-INV-150",
        "slug": "perfect-power-150ah-inverter-battery",
        "categorySlug": "inverter-batteries",
        "shortDesc": "Tall tubular inverter battery for long backup hours",
        "description": "Heavy-duty tall tubular battery engineered for maximum backup in power-intensive environments. Ideal for home inverters up to 2KVA.",
        "price": 14500,
        "dealerPrice": 12500,
        "taxRate": 12,
        "warrantyMonths": 24,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 4,
        "inventory": 89,
        "images": [
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783665152/cmi-batteries/products/j3wzlcieuacnlfg3ttph.jpg",
                "publicId": "cmi-batteries/products/j3wzlcieuacnlfg3ttph",
                "altText": "Perfect Power 150Ah Inverter Battery",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/inverter.png",
                "publicId": "cmi_inverter_150",
                "altText": "Perfect Power 150Ah Inverter Battery",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "150", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Type", "value": "Tall Tubular", "unit": "", "sortOrder": 3},
            {"label": "Backup", "value": "8-10", "unit": "hrs", "sortOrder": 4},
            {"label": "Weight", "value": "52", "unit": "kg", "sortOrder": 5},
        ],
    },
    {
        "id": "cmr922qne000goou1njyko9yz",
        "name": "Perfect LiFe 200Ah Lithium Iron Battery",
        "sku": "PB-LIFE-200",
        "slug": "perfect-life-200ah-lithium-iron-battery",
        "categorySlug": "lithium-batteries",
        "shortDesc": "200Ah LiFePO4 for heavy-duty solar and commercial use",
        "description": "High-capacity 200Ah lithium iron phosphate battery designed for commercial solar systems, data centers, and critical power applications.",
        "price": 62000,
        "dealerPrice": 54000,
        "taxRate": 18,
        "warrantyMonths": 24,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 5,
        "inventory": 172,
        "images": [
            {
                "url": "https://res.cloudinary.com/delk61fp0/image/upload/v1783665190/cmi-batteries/products/gjyjcwabiv639ynfnef8.jpg",
                "publicId": "cmi-batteries/products/gjyjcwabiv639ynfnef8",
                "altText": "Perfect LiFe 200Ah Lithium Iron Battery",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/product_lineup_1778229235672.png",
                "publicId": "cmi_batt1_lineup",
                "altText": "Perfect LiFe 200Ah Lineup",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "200", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Chemistry", "value": "LiFePO4", "unit": "", "sortOrder": 3},
            {"label": "Cycle Life", "value": "2000+", "unit": "cycles", "sortOrder": 4},
            {"label": "Weight", "value": "24", "unit": "kg", "sortOrder": 5},
        ],
    },
    {
        "id": "cmr922rj60010oou1tu7nu00v",
        "name": "Perfect Guard 7Ah UPS Battery",
        "sku": "PB-UPS-7",
        "slug": "perfect-guard-7ah-ups-battery",
        "categorySlug": "ups-batteries",
        "shortDesc": "Sealed lead-acid battery for home and office UPS systems",
        "description": "Reliable sealed maintenance-free battery providing consistent power backup for UPS systems. Available in 6V and 12V configurations.",
        "price": 1850,
        "dealerPrice": 1500,
        "taxRate": 18,
        "warrantyMonths": 18,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 6,
        "inventory": 172,
        "images": [
            {
                "url": "/assets/batt2-removebg-preview.png",
                "publicId": "cmi_batt2_ups",
                "altText": "Perfect Guard 7Ah UPS Battery",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/batt2.jpeg",
                "publicId": "cmi_batt2_ups_side",
                "altText": "Perfect Guard UPS Battery Angle",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Capacity", "value": "7", "unit": "Ah", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Type", "value": "AGM VRLA", "unit": "", "sortOrder": 3},
            {"label": "Dimensions", "value": "151×65×97", "unit": "mm", "sortOrder": 4},
            {"label": "Weight", "value": "2.1", "unit": "kg", "sortOrder": 5},
        ],
    },
    {
        "id": "cmrfwpggm00052wu1pw07vsdh",
        "name": "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries",
        "sku": "REDON LIPRO2000",
        "slug": "redon-lipro-12v-2000-va-perfect-lithium-batteries",
        "categorySlug": "lithium-batteries",
        "shortDesc": "12V 2000VA High-Efficiency Lithium Power System",
        "description": "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries with integrated smart BMS, ultra-high efficiency inverter support, and rapid charging.",
        "price": 110000,
        "dealerPrice": 100000,
        "taxRate": 18,
        "warrantyMonths": 12,
        "isActive": 1,
        "isFeatured": 1,
        "sortOrder": 7,
        "inventory": 100,
        "images": [
            {
                "url": "/assets/batt1-removebg-preview.png",
                "publicId": "cmi_redon_lipro",
                "altText": "REDON LIPRO 12V - 2000 VA Perfect Lithium Batteries",
                "isPrimary": 1,
                "sortOrder": 0,
            },
            {
                "url": "/assets/product_lineup_1778229235672.png",
                "publicId": "cmi_redon_lipro_side",
                "altText": "REDON LIPRO Lithium Power System",
                "isPrimary": 0,
                "sortOrder": 1,
            },
        ],
        "specs": [
            {"label": "Power Rating", "value": "2000", "unit": "VA", "sortOrder": 1},
            {"label": "Voltage", "value": "12", "unit": "V", "sortOrder": 2},
            {"label": "Chemistry", "value": "LiFePO4", "unit": "", "sortOrder": 3},
            {"label": "Type", "value": "Smart Lithium System", "unit": "", "sortOrder": 4},
        ],
    },
]

TECHNICAL_SPECS = [
    {"id": "cmrfwb3mr00012wu1qxgfptpo", "model": "12 : Z4 / 4LB", "volts": "12V", "capacity": "Z4", "length": "10", "breadth": "10", "height": "10", "weight": "0.260", "sortOrder": 0},
    {"id": "cmrfwc23h00022wu1i5umx59z", "model": "12 : Z5 / 5LB", "volts": "12V", "capacity": "5Ah", "length": "11", "breadth": "11", "height": "12", "weight": "0.300", "sortOrder": 1},
    {"id": "cmrfwdoa900032wu1hix1kb0z", "model": "12 : Z7 / 7LB", "volts": "12V", "capacity": "7Ah", "length": "12", "breadth": "12", "height": "12", "weight": "0.350", "sortOrder": 2},
    {"id": "cmrfwf93900042wu1ju84pii5", "model": "12 : Z9 / 9LB", "volts": "12V", "capacity": "9Ah", "length": "12", "breadth": "10", "height": "12", "weight": "0.380", "sortOrder": 3},
    {"id": "cmip-life-100", "model": "CMIP LiFe 100Ah", "volts": "12V", "capacity": "100Ah", "length": "32.6", "breadth": "17.5", "height": "22.0", "weight": "13.0", "sortOrder": 4},
    {"id": "cmip-life-200", "model": "CMIP LiFe 200Ah", "volts": "12V", "capacity": "200Ah", "length": "52.0", "breadth": "24.0", "height": "22.0", "weight": "24.0", "sortOrder": 5},
    {"id": "cmip-inv-150", "model": "CMIP SMART INVERTER", "volts": "12V/24V", "capacity": "150Ah", "length": "50.5", "breadth": "19.0", "height": "41.0", "weight": "52.0", "sortOrder": 6},
]

def update_db(db_path):
    print(f"\nUpdating database: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()

    # 1. Upsert categories
    for cat in CATEGORIES:
        cur.execute("SELECT id FROM categories WHERE id = ? OR slug = ?", (cat["id"], cat["slug"]))
        row = cur.fetchone()
        if row:
            cur.execute("""
                UPDATE categories 
                SET name = ?, slug = ?, description = ?, sortOrder = ?, isActive = 1, updatedAt = ?
                WHERE id = ?
            """, (cat["name"], cat["slug"], cat["description"], cat["sortOrder"], now, row[0]))
        else:
            cur.execute("""
                INSERT INTO categories (id, name, slug, description, image, imageId, isActive, sortOrder, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, NULL, NULL, 1, ?, ?, ?)
            """, (cat["id"], cat["name"], cat["slug"], cat["description"], cat["sortOrder"], now, now))

    # Build category slug -> id mapping
    cat_map = {row[1]: row[0] for row in cur.execute("SELECT id, slug FROM categories").fetchall()}

    # 2. Clean old products and child tables
    cur.execute("DELETE FROM product_specs")
    cur.execute("DELETE FROM product_images")
    cur.execute("DELETE FROM inventory")
    cur.execute("DELETE FROM products")

    # 3. Insert new products
    for p in PRODUCTS:
        cat_id = cat_map.get(p.get("categorySlug")) or cat_map.get("lithium-batteries")
        cur.execute("""
            INSERT INTO products (
                id, name, slug, description, shortDesc, sku, price, dealerPrice, taxRate,
                categoryId, isActive, isFeatured, warrantyMonths, weight, datasheetUrl,
                metaTitle, metaDesc, sortOrder, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?)
        """, (
            p["id"], p["name"], p["slug"], p["description"], p["shortDesc"], p["sku"],
            p["price"], p["dealerPrice"], p["taxRate"], cat_id, p["isActive"],
            p["isFeatured"], p["warrantyMonths"], p["name"], p["shortDesc"], p["sortOrder"],
            now, now
        ))

        # Insert images
        for img in p["images"]:
            img_id = generate_cuid()
            cur.execute("""
                INSERT INTO product_images (id, productId, url, publicId, altText, isPrimary, sortOrder)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (img_id, p["id"], img["url"], img["publicId"], img["altText"], img["isPrimary"], img["sortOrder"]))

        # Insert specs
        for spec in p["specs"]:
            spec_id = generate_cuid()
            cur.execute("""
                INSERT INTO product_specs (id, productId, label, value, unit, sortOrder)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (spec_id, p["id"], spec["label"], spec["value"], spec["unit"], spec["sortOrder"]))

        # Insert inventory
        inv_id = generate_cuid()
        cur.execute("""
            INSERT INTO inventory (id, productId, quantity, reservedQuantity, lowStockThreshold, updatedAt)
            VALUES (?, ?, ?, 0, 10, ?)
        """, (inv_id, p["id"], p["inventory"], now))

    # 4. Upsert technical specs
    cur.execute("DELETE FROM technical_specs")
    for ts in TECHNICAL_SPECS:
        cur.execute("""
            INSERT INTO technical_specs (id, model, volts, capacity, length, breadth, height, weight, sortOrder, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (ts["id"], ts["model"], ts["volts"], ts["capacity"], ts["length"], ts["breadth"], ts["height"], ts["weight"], ts["sortOrder"], now, now))

    conn.commit()
    
    # Verify counts
    cur.execute("SELECT count(*) FROM products")
    p_cnt = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM categories")
    c_cnt = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM product_images")
    img_cnt = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM product_specs")
    spec_cnt = cur.fetchone()[0]
    print(f"Verified {db_path}: {p_cnt} products, {c_cnt} categories, {img_cnt} images, {spec_cnt} specs.")
    conn.close()

if __name__ == "__main__":
    for path in ["data/cmis.db", "prisma/seed.db"]:
        try:
            update_db(path)
        except Exception as e:
            print(f"Error on {path}: {e}")
