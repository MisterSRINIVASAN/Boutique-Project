import urllib.request, urllib.error
try:
    urllib.request.urlopen('https://boutique-project.onrender.com/api/products/categories')
except urllib.error.HTTPError as e:
    print(e.read())
