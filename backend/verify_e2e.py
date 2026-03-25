import requests
import time
import subprocess

def test_flow():
    base_url = "http://localhost:8000"
    print(f"Testing Backend at {base_url}...")
    
    try:
        # 1. Check Root
        res = requests.get(base_url)
        print(f"Root check: {res.status_code} - {res.json()}")

        # 2. Check Products
        res = requests.get(f"{base_url}/api/products")
        products = res.json()
        print(f"Products found: {len(products)}")
        for p in products:
            print(f"- {p['name']} ({p['id']}) @ ₹{p['price']}")

        # 3. Test Checkout
        if products:
            p = products[0]
            size = p['sizes'][0]['size_label']
            order_payload = {
                "user_id": "test_user_e2e",
                "address": "123 Verification St, Test City",
                "items": [{"product_id": p['id'], "size_label": size, "quantity": 1}]
            }
            print(f"Attempting checkout for {p['name']} size {size}...")
            res = requests.post(f"{base_url}/api/orders/", json=order_payload)
            if res.status_code == 200:
                order = res.json()
                print(f"Checkout SUCCESS: Order ID {order['id']}")
                
                # 4. Check Admin Notifications
                print("Checking Admin Notifications...")
                # Mock login for token (or skip if we know the token)
                ADMIN_TOKEN = "super_secret_admin_token"
                res = requests.get(f"{base_url}/api/admin/notifications", headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
                notifs = res.json()
                print(f"Notifications in log: {len(notifs)}")
                for n in notifs[-2:]: # Last two
                    print(f"  [{n['type']}] To {n['recipient']}: {n['content']}")
            else:
                print(f"Checkout FAILED: {res.status_code} - {res.text}")

    except Exception as e:
        print(f"ERROR during test: {str(e)}")

if __name__ == "__main__":
    test_flow()
