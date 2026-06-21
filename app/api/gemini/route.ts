import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

// Get default platform environmental key
const defaultApiKey = process.env.GEMINI_API_KEY;

// Unified completion engine proxy that can route requests to different providers based on headers
async function queryAI({
  provider,
  clientApiKey,
  customBaseUrl,
  customModelName,
  systemInstruction,
  promptText,
  responseSchema,
}: {
  provider: string;
  clientApiKey: string;
  customBaseUrl: string;
  customModelName: string;
  systemInstruction: string;
  promptText: string;
  responseSchema?: any;
}): Promise<string> {
  const isJsonResponse = !!responseSchema;

  // 1. DEFAULT GEMINI
  if (provider === 'default_gemini' || !provider) {
    if (!defaultApiKey) {
      throw new Error('کلید پیش‌فرض پلتفرم (GEMINI_API_KEY) در سرور یافت نشد. لطفاً از بخش تنظیمات پشتیبان، کلید اختصاصی خود را وارد نمایید.');
    }
    const ai = new GoogleGenAI({
      apiKey: defaultApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        ...(isJsonResponse ? { responseMimeType: 'application/json', responseSchema } : {}),
      },
    });

    return response.text || '';
  }

  // 2. CUSTOM GEMINI (Google AI Studio)
  if (provider === 'gemini') {
    if (!clientApiKey) {
      throw new Error('کلید اختصاصی Google Gemini وارد نشده است. لطفا کلید خود را در بخش تنظیمات قرار دهید.');
    }
    const ai = new GoogleGenAI({
      apiKey: clientApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: customModelName || 'gemini-2.5-flash',
      contents: promptText,
      config: {
        systemInstruction,
        ...(isJsonResponse ? { responseMimeType: 'application/json', responseSchema } : {}),
      },
    });

    return response.text || '';
  }

  // 3. OPENAI / DEEPSEEK / OPENROUTER / LOCAL OLLAMA
  let url = '';
  let resolvedModel = '';

  // Prevent Server-Side Request Forgery (SSRF)
  if (customBaseUrl) {
    try {
      const parsedUrl = new URL(customBaseUrl);
      if (parsedUrl.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed for custom providers.');
      }

      let hostname = parsedUrl.hostname;
      hostname = hostname.replace(/^\[|\]$/g, '');

      let addresses: string[] = [];
      const isDirectIP = /^[0-9a-fA-F:\.]+$/.test(hostname);
      if (isDirectIP) {
        addresses.push(hostname);
      } else {
        try {
          const records = await dns.lookup(hostname, { all: true });
          addresses = records.map(r => r.address);
        } catch (dnsErr) {
          throw new Error(`DNS resolution failed for hostname: ${hostname}`);
        }
      }

      if (addresses.length === 0) {
        throw new Error(`Could not resolve hostname: ${hostname}`);
      }

      for (const address of addresses) {
        const isLocalhost = ['127.0.0.1', '::1', '0.0.0.0', 'localhost'].includes(address) || address.startsWith('127.');
        const isInternalIp = /^10\./.test(address) ||
                            /^169\.254\./.test(address) ||
                            /^192\.168\./.test(address) ||
                            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(address) ||
                            /^fc00:/i.test(address) ||
                            /^fe80:/i.test(address);

        if (isLocalhost || isInternalIp) {
          throw new Error('Access to internal or private networks is restricted.');
        }
      }
    } catch (err: any) {
      throw new Error(`Invalid custom URL: ${err.message}`);
    }
  }

  if (provider === 'openai') {
    url = customBaseUrl || 'https://api.openai.com/v1';
    resolvedModel = customModelName || 'gpt-4o-mini';
  } else if (provider === 'deepseek') {
    url = customBaseUrl || 'https://api.deepseek.com';
    resolvedModel = customModelName || 'deepseek-chat';
  } else if (provider === 'openrouter') {
    url = customBaseUrl || 'https://openrouter.ai/api/v1';
    resolvedModel = customModelName || 'meta-llama/llama-3-8b-instruct:free';
  } else if (provider === 'local') {
    throw new Error('The local provider is disabled for security reasons.');
  } else {
    throw new Error(`ارائه‌دهنده نامعتبر یا پشتیبانی نشده است: ${provider}`);
  }

  if (!clientApiKey) {
    throw new Error(`کلید API برای ارائه‌دهنده ${provider} مشخص نشده است.`);
  }

  const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  const endpoint = `${cleanUrl}/chat/completions`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (clientApiKey) {
    headers['Authorization'] = `Bearer ${clientApiKey}`;
  }

  if (provider === 'openrouter') {
    headers['HTTP-Referer'] = 'https://ai.studio/build';
    headers['X-Title'] = 'IP Plus Network Laboratory';
  }

  let finalPrompt = promptText;
  if (isJsonResponse) {
    finalPrompt += '\n\nIMPORTANT: Return ONLY a valid JSON object matching the requested schema. No conversational prefix, suffix, or markdown blocks.';
  }

  const body = {
    model: resolvedModel,
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: finalPrompt },
    ],
    temperature: 0.7,
    ...(isJsonResponse ? { response_format: { type: 'json_object' } } : {}),
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000), // 20-second timeout for remote APIs
  });

  if (!res.ok) {
    const errText = await res.text();
    let readableError = errText;
    try {
      const parsedErr = JSON.parse(errText);
      readableError = parsedErr.error?.message || parsedErr.message || errText;
    } catch (_) {}
    throw new Error(`سرور سرویس‌دهنده کدهای خطا بازگرداند (${res.status}): ${readableError}`);
  }

  const resJson = await res.json();
  const content = resJson.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('پاسخ خالی یا نامعتبر از ارائه‌دهنده عاید شد.');
  }

  return content;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // Retrieve client-supplied routing parameters via custom headers
    const provider = req.headers.get('x-ai-provider') || 'default_gemini';
    const clientApiKey = req.headers.get('x-ai-api-key') || '';
    const customBaseUrl = req.headers.get('x-ai-base-url') || '';
    const customModelName = req.headers.get('x-ai-model-name') || '';

    // Action 0: CHECK STATUS / DIAGNOSTICS PING
    if (action === 'checkStatus') {
      try {
        const pingResult = await queryAI({
          provider,
          clientApiKey,
          customBaseUrl,
          customModelName,
          systemInstruction: 'You are a service status checker. Just answer with "OK". No extra talk.',
          promptText: 'Ping connection test.',
        });
        
        return NextResponse.json({
          status: 'ok',
          text: pingResult.trim(),
          details: 'اتصال به وب‌سرویس هوش مصنوعی انتخاب‌شده با موفقیت برقرار شد!',
        });
      } catch (err: any) {
        return NextResponse.json({
          status: 'error',
          error: err?.message || 'برقراری ارتباط با سرویس به شکست انجامید.',
        }, { status: 500 });
      }
    }

    // Action 1: GENERATE QUIZ (Expects JSON output)
    if (action === 'generateQuiz') {
      const { ip, cidr } = payload;
      const promptText = `Generate exactly 5 extremely unique, educational, and scenario-based networking multiple-choice questions in Persian language.
At least 2 questions must be directly relevant to analyzing the current IP Address: ${ip} with prefix /${cidr} (e.g., subnetting calculations, valid host ranges, network ID, broadcast address).
The remaining 3 questions should cover advanced real-world networking topics such as routing, port configurations, firewalls, and protocols.
Ensure options are clear, and provide a helpful, descriptive hint in Persian explaining the step-by-step logic for the correct answer. Do not include markdown code blocks, return raw JSON matching the schema.`;

      const systemInstruction = 'You are an expert Cisco and Juniper systems certification examiner. Your goal is to test the student with high-quality, mathematically accurate, and beautiful scenario-based questions. All fields in the JSON response must be in Persian.';

      const responseText = await queryAI({
        provider,
        clientApiKey,
        customBaseUrl,
        customModelName,
        systemInstruction,
        promptText,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  correctAnswer: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  hint: { type: Type.STRING },
                },
                required: ['question', 'correctAnswer', 'options', 'hint'],
              },
            },
          },
          required: ['questions'],
        },
      });

      const data = JSON.parse(responseText.trim());
      return NextResponse.json(data);
    }

    // Action 2: GENERATE FLASHCARDS (Expects JSON output)
    if (action === 'generateAIFlashcards') {
      const promptText = `Generate 3 brand-new interactive flashcards and 4 advanced networking topics for the cheat sheet in Persian language.
Avoid repeating existing topics (such as FTP, SSH, DNS, HTTP, Private IP, RFC 1918, Subnetting Formulas).
For the flashcards: choose highly interesting and certified topics (such as BGP routing, DHCP process, NAT/PAT, OSI model, VlANs, ICMP, ARP).
For the cheat sheet: write advanced topics with formulas or structured descriptions (e.g. OSPF metric, CIDR table, IPv6 notation, VLAN tagging).
Output the response strictly inside the requested JSON schema.`;

      const systemInstruction = 'You are a senior network architect and technical writer. Provide educational, beautiful, and highly accurate networking content in Persian. Use justified, clear, and perfectly formatted Persian prose.';

      const responseText = await queryAI({
        provider,
        clientApiKey,
        customBaseUrl,
        customModelName,
        systemInstruction,
        promptText,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newFlashcards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  tag: { type: Type.STRING },
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING },
                },
                required: ['tag', 'title', 'desc'],
              },
            },
            newCheatSheetItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  details: { type: Type.STRING },
                },
                required: ['category', 'title', 'details'],
              },
            },
          },
          required: ['newFlashcards', 'newCheatSheetItems'],
        },
      });

      const data = JSON.parse(responseText.trim());
      return NextResponse.json(data);
    }

    // Action 3: ANALYSE IP (Expects Text output)
    if (action === 'analyseIp') {
      const { ip, subnetDetails } = payload;
      const promptText = `Please analyze this IP Address: ${ip} with Subnet Mask: ${subnetDetails.subnetMask} (${subnetDetails.class} Class). This is evaluated as: ${subnetDetails.type}. Network ID: ${subnetDetails.networkID}, Broadcast: ${subnetDetails.broadcast}.`;

      const systemInstruction = `تو یک متخصص، مهندس و مربی ارشد امنیت و معماری شبکه هستی.
باید آدرس IP ارائه‌شده توسط کاربر را به طور کامل تحلیل کنی.
پاسخ باید کاملاً به زبان فارسی، بسیار روان، شیرین، آموزشی و ساختاریافته در قالب ۳ بخش اصلی باشد:
۱) ماهیت و جایگاه کاربردی این رنج آی‌پی در دنیا یا شبکه‌های داخلی
۲) سناریوهای استقرار دنیای واقعی که این رنج در آن استفاده می‌شود
۳) نکات مهم امنیتی و اصول بهینه‌سازی فایروال برای این محدوده.
لحن پاسخ باید صمیمی و در عین حال کاملاً مهندسی و الهام‌بخش باشد.`;

      const responseText = await queryAI({
        provider,
        clientApiKey,
        customBaseUrl,
        customModelName,
        systemInstruction,
        promptText,
      });

      return NextResponse.json({ text: responseText });
    }

    // Action 4: DESIGN SUBNETS VLSM (Expects Text output)
    if (action === 'designSubnets') {
      const { scenario } = payload;
      const promptText = `Design subnetting architecture for this user requirement: ${scenario}`;
      
      const systemInstruction = `تو یک مهندس ارشد و طراح زیرساخت شبکه هستی که مهارت فوق‌العاده‌ای در طراحی VLSM و تقسیم زیرشبکه‌ها داری.
کاربر یک سناریو یا نیازمندی برای شرکت یا سازمان خود داده است.
باید به فارسی روان، پاسخ بسیار دقیقی طراحی کنی و رنج آی‌پی‌ها، سابنت ماسک‌ها، گیت‌وی‌ها، محدوده هاست‌های مجاز و برودکست هر بخش را جدول‌بندی کنی.
حتماً توضیح بده که چرا این معماری را پیشنهاد دادی تا جنبه آموزشی برنامه کاملاً حفظ شود.
از استایل‌دهی تمیز استفاده کن تا متن فارسی و انگلیسی آدرس‌ها تداخل نداشته باشند.`;

      const responseText = await queryAI({
        provider,
        clientApiKey,
        customBaseUrl,
        customModelName,
        systemInstruction,
        promptText,
      });

      return NextResponse.json({ text: responseText });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('Gemini API Router error:', error);
    
    let readableError = error?.message || 'یک خطای ناهماهنگ در برقراری ارتباط با پلتفرم هوش مصنوعی رخ داده است.';
    
    if (readableError.includes('ApiError')) {
      try {
        const match = readableError.match(/\{.*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed?.error?.message) {
            readableError = parsed.error.message;
            if (readableError.toLowerCase().includes('503') || readableError.toLowerCase().includes('demand') || readableError.toLowerCase().includes('overloaded')) {
              readableError = 'ترافیک ورودی به هوش مصنوعی بسیار بالاست. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.';
            }
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    } else if (readableError.toLowerCase().includes('503') || readableError.toLowerCase().includes('demand')) {
      readableError = 'ترافیک ورودی به هوش مصنوعی بسیار بالاست. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.';
    }

    return NextResponse.json(
      { error: readableError },
      { status: 500 }
    );
  }
}
