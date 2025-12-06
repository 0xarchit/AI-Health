const fs = require('fs');
const path = require('path');


const BASE_URL = 'http://localhost:3000'; 
const REFRESH_TOKEN = decodeURIComponent('refresh-token');
const IMAGES_DIR = path.join(__dirname, 'images');


const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function authenticate() {
  console.log("Authenticating...");
  try {
    const authRes = await fetch(`${BASE_URL}/api/auth/status`, {
      headers: {
        'Cookie': `refresh_token=${REFRESH_TOKEN}`
      }
    });

    if (!authRes.ok) {
        console.error(`${colors.red}Auth Endpoint Failed: ${authRes.status}${colors.reset}`);
        return null;
    }

    let cookies = [];
    if (typeof authRes.headers.getSetCookie === 'function') {
        cookies = authRes.headers.getSetCookie();
    } else {
        const raw = authRes.headers.get('set-cookie');
        if (raw) cookies = [raw]; 
    }

    for (const cookie of cookies) {
       const match = cookie.match(/session_token=([^;]+)/);
       if (match) {
         console.log(`${colors.green}Authenticated! Session Token obtained.${colors.reset}`);
         return match[1];
       }
    }
    
    console.log(`${colors.yellow}Warning: No session_token cookie found.${colors.reset}`);
    return null;
  } catch (e) {
    console.error("Auth Exception:", e);
    return null;
  }
}


async function processImage(file, batchId, getHeaders, reAuthenticate) {
    try {
        console.log(`${colors.cyan}[Batch ${batchId}] Starting ${file}...${colors.reset}`);
        const filePath = path.join(IMAGES_DIR, file);
        const fileBuffer = fs.readFileSync(filePath);
        const fileBlob = new Blob([fileBuffer], { type: 'image/jpeg' });

        
        const uploadFormData = new FormData();
        uploadFormData.append('image', fileBlob, file);

        let uploadRes = await fetch(`${BASE_URL}/api/upload`, {
          method: 'POST',
          headers: getHeaders(),
          body: uploadFormData
        });

        
        if (uploadRes.status === 401) {
             console.log(`${colors.yellow}[Batch ${batchId}] 401 Upload. Refreshing...${colors.reset}`);
             const newToken = await reAuthenticate();
             if (newToken) {
                 uploadRes = await fetch(`${BASE_URL}/api/upload`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: uploadFormData
                 });
             } else {
                 return { status: 'error', msg: 'Auth failed' };
             }
        }

        if (!uploadRes.ok) {
           const txt = await uploadRes.text();
           console.error(`${colors.red}[Batch ${batchId}] Upload Fail: ${uploadRes.status} - ${txt}${colors.reset}`);
           return { status: 'error' };
        }

        const uploadData = await uploadRes.json();
        const imageUrl = uploadData.url;

        
        const analyzeFormData = new FormData();
        analyzeFormData.append('file', fileBlob, file);
        analyzeFormData.append('imageUrl', imageUrl);
        analyzeFormData.append('gender', 'male');

        let analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: getHeaders(),
          body: analyzeFormData
        });

        if (analyzeRes.status === 401) {
             console.log(`${colors.yellow}[Batch ${batchId}] 401 Analyze. Refreshing...${colors.reset}`);
             const newToken = await reAuthenticate();
             if (newToken) {
                 analyzeRes = await fetch(`${BASE_URL}/api/analyze`, {
                    method: 'POST',
                    headers: getHeaders(),
                    body: analyzeFormData
                 });
             }
        }

        if (analyzeRes.status === 429 || analyzeRes.status === 503 || analyzeRes.status === 500) {
            
            
            if (analyzeRes.status === 429 || analyzeRes.status === 503) {
                console.log(`${colors.red}[Batch ${batchId}] QUOTA HIT (${analyzeRes.status})${colors.reset}`);
                return { status: 'quota', code: analyzeRes.status };
            }
        }

        if (!analyzeRes.ok) {
           const errText = await analyzeRes.text();
           console.error(`${colors.red}[Batch ${batchId}] Analysis Fail: ${analyzeRes.status} - ${errText}${colors.reset}`);
           
           if (errText.includes("quota") || errText.includes("429")) return { status: 'quota' };
           return { status: 'error' };
        }

        const result = await analyzeRes.json();
        console.log(`${colors.green}[Batch ${batchId}] Success! ${file} Analyzed.${colors.reset}`);
        
        return { status: 'ok' };

    } catch (e) {
        console.error(`[Batch ${batchId}] Exception:`, e);
        return { status: 'error' };
    }
}

async function runTest() {
  console.log(`${colors.cyan}Starting Parallel Quota Test...${colors.reset}`);
  
  let sessionToken = await authenticate();
  if (!sessionToken) return;

  if (!fs.existsSync(IMAGES_DIR)) {
    console.error("No images dir");
    return;
  }
  const files = fs.readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.error("No images found");
    return;
  }

  console.log(`Found ${files.length} images. Starting batches...`);

  let batchCount = 0;
  let keepRunning = true;
  let totalRequests = 0;

  
  const getToken = () => sessionToken;
  const reAuthMutex = { locked: false };
  
  const reAuthenticate = async () => {
      if (reAuthMutex.locked) {
          
          await sleep(2000); 
          return sessionToken;
      }
      reAuthMutex.locked = true;
      const newToken = await authenticate();
      if (newToken) sessionToken = newToken;
      reAuthMutex.locked = false;
      return sessionToken;
  };

  while (keepRunning) {
    batchCount++;
    console.log(`\n${colors.cyan}--- Starting Batch #${batchCount} (${files.length} concurrent requests) ---${colors.reset}`);
    
    const getHeaders = () => ({
      'Cookie': `refresh_token=${REFRESH_TOKEN}; session_token=${sessionToken || ''}`
    });

    
    const promises = files.map(file => processImage(file, batchCount, getHeaders, reAuthenticate));
    const results = await Promise.all(promises);

    
    const quotaHit = results.find(r => r.status === 'quota');
    const successes = results.filter(r => r.status === 'ok').length;
    totalRequests += successes;

    if (quotaHit) {
        console.log(`${colors.red}\n!!! QUOTA LIMIT REACHED !!!${colors.reset}`);
        console.log(`${colors.yellow}Stopped at Batch #${batchCount}.${colors.reset}`);
        console.log(`${colors.yellow}Total Successful Requests: ~${totalRequests}${colors.reset}`);
        keepRunning = false;
        break;
    }

    
    console.log(`${colors.cyan}Batch complete. Clearing History...${colors.reset}`);
    try {
        await fetch(`${BASE_URL}/api/history`, {
           method: 'DELETE',
           headers: getHeaders()
        });
    } catch (e) {
        console.error("Failed to clear history:", e);
    }

    console.log(`${colors.green}Batch #${batchCount} Finished. Total Successes: ${totalRequests}${colors.reset}`);
    await sleep(1000); 
  }
}

runTest();
