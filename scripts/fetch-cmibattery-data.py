import urllib.request
import json

slugs = [
    "12v-z4-4ah-4lb-perfect-lithium-batteries",
    "12v-z5-5ah-5lb-perfect-lithium-batteries",
    "perfect-life-100ah-lithium-iron-battery",
    "perfect-power-150ah-inverter-battery",
    "perfect-life-200ah-lithium-iron-battery",
    "perfect-guard-7ah-ups-battery",
    "redon-lipro-12v-2000-va-perfect-lithium-batteries"
]

headers = {"User-Agent": "Mozilla/5.0"}
all_products = []

for s in slugs:
    url = f"https://cmibattery.com/api/products/{s}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            d = json.loads(resp.read().decode("utf-8"))
            p = d.get("data", {}).get("product")
            if p:
                all_products.append(p)
                print(f"Fetched: {p.get('name')} | SKU: {p.get('sku')} | Price: {p.get('price')} | Specs: {len(p.get('specs', []))} | Images: {len(p.get('images', []))}")
    except Exception as e:
        print(f"Error fetching {s}: {e}")

req_cat = urllib.request.Request("https://cmibattery.com/api/categories", headers=headers)
with urllib.request.urlopen(req_cat) as resp:
    categories = json.loads(resp.read().decode("utf-8")).get("data", [])

result = {
    "categories": categories,
    "products": all_products
}

with open("cmibattery_scraped_data.json", "w") as f:
    json.dump(result, f, indent=2)

print(f"\nSaved {len(all_products)} products and {len(categories)} categories to cmibattery_scraped_data.json")
