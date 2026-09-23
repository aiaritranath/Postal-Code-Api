const BASE_URL = "https://api.postalpincode.in";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");
}

async function getJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Upstream API failed: ${response.status}`);
  }

  return response.json();
}

function extractPostOffices(apiResponse) {
  if (!Array.isArray(apiResponse)) return [];

  return apiResponse.flatMap((item) =>
    Array.isArray(item.PostOffice) ? item.PostOffice : []
  );
}

function uniquePostOffices(list) {
  const seen = new Set();
  const output = [];

  for (const item of list) {
    const key = `${item.Name || ""}|${item.Pincode || ""}|${item.BranchType || ""}`;

    if (!seen.has(key)) {
      seen.add(key);
      output.push(item);
    }
  }

  return output;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Only GET method allowed",
    });
  }

  const API_KEY = process.env.API_KEY || "aritra";

  const { key, pincode, postoffice } = req.query;

  if (key !== API_KEY) {
    return res.status(401).json({
      status: "error",
      message: "Invalid API key",
    });
  }

  if (!pincode && !postoffice) {
    return res.status(400).json({
      status: "error",
      message: "Use ?pincode=110001 or ?postoffice=New Delhi or both",
    });
  }

  try {
    const requests = [];
    const byPincode = [];
    const byPostoffice = [];

    if (pincode) {
      requests.push(
        getJson(`${BASE_URL}/pincode/${encodeURIComponent(pincode)}`).then((data) => {
          byPincode.push(...extractPostOffices(data));
        })
      );
    }

    if (postoffice) {
      requests.push(
        getJson(`${BASE_URL}/postoffice/${encodeURIComponent(postoffice)}`).then((data) => {
          byPostoffice.push(...extractPostOffices(data));
        })
      );
    }

    await Promise.all(requests);

    const merged = uniquePostOffices([...byPincode, ...byPostoffice]);

    return res.status(200).json({
      status: "success",
      query: {
        pincode: pincode || null,
        postoffice: postoffice || null,
      },
      count: merged.length,
      postOffices: merged,
      sources: {
        pincodeCount: byPincode.length,
        postofficeCount: byPostoffice.length,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};