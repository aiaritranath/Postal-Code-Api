# 📮 Postal Code API

A lightweight **Vercel Serverless API** for looking up Indian postal/PIN code information and post office details.

The API supports searches by **PIN code**, **post office name**, or both. It uses the public [India Post PIN Code API](https://api.postalpincode.in/) as its upstream data source and provides a simple JSON response suitable for websites, apps, automation workflows, and backend services.

---

## ✨ Features

- 🔎 Search by Indian **PIN code**
- 🏤 Search by **post office name**
- 🔗 Combine PIN code and post office queries
- 🔐 Simple API-key protection
- 🌐 CORS enabled for browser/client-side requests
- ♻️ Removes duplicate post office records
- ⚡ Uses parallel upstream requests when both search parameters are supplied
- ☁️ Designed for **Vercel Serverless Functions**
- 📦 Minimal project with no runtime dependencies

---

## 📁 Project Structure

```text
Postal-Code-Api-main/
├── api/
│   └── postal.js          # Vercel serverless API function
├── package.json           # Project metadata and Node.js requirement
└── vercel.json            # Friendly route rewrites
```

---

## 🛠️ Tech Stack

- **Node.js** 18+
- **Vercel Serverless Functions**
- JavaScript
- `fetch()` for upstream API requests
- **India Post PIN Code API** as the data source

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/Postal-Code-Api.git
cd Postal-Code-Api
```

### 2. Install dependencies

There are currently no npm runtime dependencies, but you can still run:

```bash
npm install
```

### 3. Configure the API key

The API reads the key from the Vercel environment variable:

```text
API_KEY
```

Example local value:

```text
API_KEY=your-secret-key
```

> **Important:** The current implementation falls back to `aritra` when `API_KEY` is not configured. For production, set your own secret `API_KEY` in Vercel and avoid relying on the fallback.

---

## ☁️ Deploy to Vercel

### Option 1 — Vercel CLI

Install the Vercel CLI if needed:

```bash
npm install -g vercel
```

Then deploy:

```bash
vercel
```

For a production deployment:

```bash
vercel --prod
```

### Option 2 — GitHub + Vercel

1. Push this project to GitHub.
2. Open [Vercel](https://vercel.com/).
3. Import the GitHub repository.
4. Deploy the project.
5. Open **Project Settings → Environment Variables**.
6. Add:

```text
Name: API_KEY
Value: your-secret-key
```

7. Redeploy the project.

No build command is required for the current project structure.

---

## 🔗 API Endpoints

The project exposes the same serverless function through three friendly routes:

```text
/pincode
/postoffice
/postal
```

All routes accept **GET** requests.

### Authentication

Every request must include the API key as the `key` query parameter:

```text
?key=YOUR_API_KEY
```

---

## 📌 1. Search by PIN Code

### Request

```http
GET /pincode?key=YOUR_API_KEY&pincode=110001
```

### Example

```text
https://your-domain.vercel.app/pincode?key=YOUR_API_KEY&pincode=110001
```

---

## 📌 2. Search by Post Office

### Request

```http
GET /postoffice?key=YOUR_API_KEY&postoffice=New%20Delhi
```

### Example

```text
https://your-domain.vercel.app/postoffice?key=YOUR_API_KEY&postoffice=New%20Delhi
```

---

## 📌 3. Search Using Both Parameters

You can provide both `pincode` and `postoffice` in the same request.

```http
GET /postal?key=YOUR_API_KEY&pincode=110001&postoffice=New%20Delhi
```

When both are supplied, the API queries both upstream endpoints in parallel, combines their results, and removes duplicate entries.

---

## 📥 Query Parameters

| Parameter | Required | Description |
|---|---|---|
| `key` | Yes | API key used to authorize the request |
| `pincode` | No* | Indian postal PIN code, e.g. `110001` |
| `postoffice` | No* | Post office name, e.g. `New Delhi` |

\* At least one of `pincode` or `postoffice` must be provided.

---

## ✅ Success Response

A successful request returns JSON similar to:

```json
{
  "status": "success",
  "query": {
    "pincode": "110001",
    "postoffice": null
  },
  "count": 1,
  "postOffices": [
    {
      "Name": "New Delhi GPO",
      "Description": null,
      "BranchType": "Head Post Office",
      "DeliveryStatus": "Delivery",
      "Circle": "Delhi",
      "District": "New Delhi",
      "Division": "New Delhi Central",
      "Region": "Delhi",
      "Block": "New Delhi",
      "State": "Delhi",
      "Country": "India",
      "Pincode": "110001"
    }
  ],
  "sources": {
    "pincodeCount": 1,
    "postofficeCount": 0
  }
}
```

The exact `postOffices` fields depend on the upstream India Post API response.

---

## ❌ Error Responses

### Invalid API key — `401`

```json
{
  "status": "error",
  "message": "Invalid API key"
}
```

### Missing search parameters — `400`

```json
{
  "status": "error",
  "message": "Use ?pincode=110001 or ?postoffice=New Delhi or both"
}
```

### Unsupported HTTP method — `405`

```json
{
  "status": "error",
  "message": "Only GET method allowed"
}
```

### Upstream/server error — `500`

```json
{
  "status": "error",
  "message": "Upstream API failed: 500"
}
```

The actual message may vary depending on the upstream response or server error.

---

## 💻 JavaScript Example

```javascript
const API_KEY = "YOUR_API_KEY";

fetch(
  `https://your-domain.vercel.app/pincode?key=${encodeURIComponent(API_KEY)}&pincode=110001`
)
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

---

## 🐍 Python Example

```python
import requests

API_KEY = "YOUR_API_KEY"

url = "https://your-domain.vercel.app/pincode"
params = {
    "key": API_KEY,
    "pincode": "110001",
}

response = requests.get(url, params=params, timeout=20)
response.raise_for_status()

print(response.json())
```

---

## 🧪 cURL Example

```bash
curl "https://your-domain.vercel.app/pincode?key=YOUR_API_KEY&pincode=110001"
```

Post office search:

```bash
curl "https://your-domain.vercel.app/postoffice?key=YOUR_API_KEY&postoffice=New%20Delhi"
```

---

## 🔐 Security Notes

The API currently uses a query-string API key:

```text
?key=YOUR_API_KEY
```

For production use:

- Set a strong `API_KEY` in Vercel Environment Variables.
- Do not commit your real API key to GitHub.
- Do not hard-code secrets in frontend applications.
- Prefer calling this service from your backend when the API key must remain private.
- Consider adding rate limiting if the endpoint will be publicly accessible at scale.

> Query parameters can appear in browser history, logs, analytics, and server logs. For a higher-security design, consider changing authentication to an HTTP header such as `Authorization` or `x-api-key`.

---

## 🌐 CORS

The API enables cross-origin requests with:

```http
Access-Control-Allow-Origin: *
```

It also supports:

```http
GET, OPTIONS
```

This makes it usable from browser-based applications, but wildcard CORS should be reviewed before exposing a protected production API to untrusted clients.

---

## 🔄 How It Works

1. The client sends a `GET` request.
2. The API validates the `key` query parameter.
3. It checks that `pincode` and/or `postoffice` was supplied.
4. It calls the corresponding India Post API endpoint(s).
5. The returned `PostOffice` arrays are extracted.
6. Results from multiple searches are merged.
7. Duplicate records are removed using post office name, PIN code, and branch type.
8. A clean JSON response is returned to the client.

---

## 📡 Upstream Data Source

This service uses:

**India Post PIN Code API**

```text
https://api.postalpincode.in
```

The application currently calls:

```text
GET https://api.postalpincode.in/pincode/{pincode}
GET https://api.postalpincode.in/postoffice/{postoffice}
```

The upstream service controls the underlying postal data returned to this API.

---

## 🧩 Vercel Rewrites

`vercel.json` maps the friendly public routes to the serverless function:

```json
{
  "rewrites": [
    { "source": "/pincode", "destination": "/api/postal" },
    { "source": "/postoffice", "destination": "/api/postal" },
    { "source": "/postal", "destination": "/api/postal" }
  ]
}
```

This means all three URLs are backed by the same function:

```text
/api/postal
```

---

## 📋 Requirements

- Node.js **18 or newer**
- A Vercel account for deployment
- An `API_KEY` environment variable for production

---

## 🤝 Contributing

Contributions and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the API locally/deployed.
5. Commit your changes.
6. Open a pull request.

---

## 📄 License

No license is currently declared in `package.json`.

If you plan to publish or distribute this project publicly, add an appropriate `LICENSE` file to define how others may use the code.

---

## 👨‍💻 Author

**Aritra Nath Hazra**

Built as a lightweight postal/PIN lookup API for modern web applications and serverless deployments.

---

## ⭐ Support

If this project is useful, consider giving the repository a ⭐ on GitHub.

---

## 🔗 Quick Reference

| Purpose | Endpoint |
|---|---|
| PIN code lookup | `/pincode?key=YOUR_API_KEY&pincode=110001` |
| Post office lookup | `/postoffice?key=YOUR_API_KEY&postoffice=New%20Delhi` |
| Combined lookup | `/postal?key=YOUR_API_KEY&pincode=110001&postoffice=New%20Delhi` |
| Serverless function | `/api/postal` |

